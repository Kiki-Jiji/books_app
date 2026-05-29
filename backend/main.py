from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.staticfiles import StaticFiles
import pandas as pd
import sqlite3
from functions import config, select, connect_to_db, aggregate_royalties
from fastapi.middleware.cors import CORSMiddleware
from models import DailySalesRecord, TitleDailySalesRecord, DayWeekSalesRecord, TitleDayWeekSalesRecord
from manage_db import migrate_groups_add_image
import os
import shutil
import uuid
from datetime import datetime
import calendar


app = FastAPI()

# Run DB migrations on startup
migrate_groups_add_image()

# Serve uploaded images
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(os.path.join(STATIC_DIR, "group_images"), exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

app.add_middleware(
    CORSMiddleware,
    # Add port 5173 to the list
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/books")
def get_books():
    """
    example return

    [{'title': 'Coming Home to Kingsbridge'},
    {'title': 'Happily Ever After in Hope Cove'},
    {'title': 'Healing the Heartbreak: Moving on in Devon'},
    {'title': 'The Worst Christmas Ever?: Christmas in Devon'},
    ]
    """
    cfg = config()
    conn = connect_to_db()

    distinct_books_sql = f"SELECT DISTINCT title FROM {cfg['table_name']};"
    df = pd.read_sql_query(distinct_books_sql, conn)

    conn.close()
    return df.to_dict(orient='records')


@app.get("/daily-sales")
def get_daily_sales(start_date: str = None, end_date: str = None, group_by: str = 'day', title: str = None) -> list[DailySalesRecord]:
    conn = connect_to_db()

    select_query = select(columns=['date', 'royalty'], start_date=start_date, end_date=end_date, title=title)
    df = pd.read_sql_query(select_query, conn)
    conn.close()

    daily_sum = aggregate_royalties(df, group_by)

    return daily_sum


@app.get("/daily-sales-multiple")
def get_daily_sales_multiple(start_date: str = None, end_date: str = None, group_by: str = 'day', titles: list[str] = Query(default=None)) -> list[TitleDailySalesRecord]:
    conn = connect_to_db()

    select_query = select(columns=['date', 'royalty', 'title'], start_date=start_date, end_date=end_date, title=titles)
    df = pd.read_sql_query(select_query, conn)
    conn.close()

    df['date'] = pd.to_datetime(df['date'])

    results = []
    for title, title_df in df.groupby('title'):
        records = aggregate_royalties(title_df, group_by)
        results.append(TitleDailySalesRecord(title=title, records=records))

    return results

@app.get("/get_day_week_sales")
def get_day_week_sales(start_date: str = None, end_date: str = None, title: list[str] = Query(default=None)) -> list[TitleDayWeekSalesRecord]:
    conn = connect_to_db()

    select_query = select(columns=['date', 'royalty', 'title'], start_date=start_date, end_date=end_date, title=title)
    df = pd.read_sql_query(select_query, conn)
    conn.close()

    df['date'] = pd.to_datetime(df['date'])

    results = []
    for book_title, title_df in df.groupby('title'):
        result = title_df.groupby(title_df['date'].dt.weekday)['royalty'].sum()
        result.index = result.index.map(lambda x: calendar.day_name[x])
        records = [DayWeekSalesRecord(day=day, royalty=royalty) for day, royalty in result.items()]
        results.append(TitleDayWeekSalesRecord(title=book_title, records=records))

    return results


@app.get("/get_book_groups")
def get_book_groups():
    cfg = config()
    conn = connect_to_db()

    query = f"""
        SELECT btg.book, g.group_name
        FROM {cfg['book_group_table_name']} btg
        JOIN {cfg['groups_table_name']} g ON btg.group_id = g.id;
    """
    df = pd.read_sql_query(query, conn)
    conn.close()

    return df.to_dict(orient='records')

@app.post("/set_book_group")
def set_book_group(vessel: str, group: str):
    cfg = config()
    conn = connect_to_db()
    cursor = conn.cursor()

    # Ensure the group exists in the groups table
    cursor.execute(f"SELECT id FROM {cfg['groups_table_name']} WHERE group_name = ?;", (group,))
    group_row = cursor.fetchone()
    if not group_row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Group '{group}' does not exist.")
    group_id = group_row[0]

    # Check if the book already has a group assignment
    cursor.execute(f"SELECT id FROM {cfg['book_group_table_name']} WHERE book = ?;", (vessel,))
    result = cursor.fetchone()

    if result:
        cursor.execute(f"UPDATE {cfg['book_group_table_name']} SET group_id = ? WHERE book = ?;", (group_id, vessel))
    else:
        cursor.execute(f"INSERT INTO {cfg['book_group_table_name']} (book, group_id) VALUES (?, ?);", (vessel, group_id))

    conn.commit()
    conn.close()

    return {"message": "Book group updated successfully."}


@app.get("/get_existing_groups")
def get_existing_groups():
    cfg = config()
    conn = connect_to_db()

    query = f"SELECT group_name, image_path FROM {cfg['groups_table_name']};"
    df = pd.read_sql_query(query, conn)
    conn.close()

    result = []
    for _, row in df.iterrows():
        image_url = None
        if row['image_path']:
            image_url = f"http://localhost:8000/static/group_images/{row['image_path']}"
        result.append({"group_name": row['group_name'], "image_url": image_url})
    return result


@app.post("/create_group")
def create_group(group: str):
    cfg = config()
    conn = connect_to_db()
    cursor = conn.cursor()

    cursor.execute(f"SELECT id FROM {cfg['groups_table_name']} WHERE group_name = ?;", (group,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=409, detail=f"Group '{group}' already exists.")

    cursor.execute(f"INSERT INTO {cfg['groups_table_name']} (group_name) VALUES (?);", (group,))
    conn.commit()
    conn.close()

    return {"message": f"Group '{group}' created successfully."}


@app.post("/upload_group_image")
def upload_group_image(group: str, file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    cfg = config()
    conn = connect_to_db()
    cursor = conn.cursor()

    cursor.execute(f"SELECT id, image_path FROM {cfg['groups_table_name']} WHERE group_name = ?;", (group,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Group '{group}' does not exist.")
    group_id, old_image_path = row

    # Remove old image file if present
    if old_image_path:
        old_file = os.path.join(STATIC_DIR, "group_images", old_image_path)
        if os.path.isfile(old_file):
            os.remove(old_file)

    ext = os.path.splitext(file.filename or "")[1].lower() or ".png"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(STATIC_DIR, "group_images", filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    cursor.execute(f"UPDATE {cfg['groups_table_name']} SET image_path = ? WHERE id = ?;", (filename, group_id))
    conn.commit()
    conn.close()

    return {"image_url": f"http://localhost:8000/static/group_images/{filename}"}


@app.delete("/delete_group")
def delete_group(group: str):
    cfg = config()
    conn = connect_to_db()
    cursor = conn.cursor()

    cursor.execute(f"SELECT id, image_path FROM {cfg['groups_table_name']} WHERE group_name = ?;", (group,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Group '{group}' does not exist.")
    group_id, image_path = row

    # Remove image file if present
    if image_path:
        image_file = os.path.join(STATIC_DIR, "group_images", image_path)
        if os.path.isfile(image_file):
            os.remove(image_file)

    # Remove all book assignments for this group first
    cursor.execute(f"DELETE FROM {cfg['book_group_table_name']} WHERE group_id = ?;", (group_id,))
    cursor.execute(f"DELETE FROM {cfg['groups_table_name']} WHERE id = ?;", (group_id,))
    conn.commit()
    conn.close()

    return {"message": f"Group '{group}' deleted successfully."}