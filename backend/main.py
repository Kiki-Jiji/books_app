from fastapi import FastAPI
import pandas as pd
import sqlite3
from functions import config, select, connect_to_db
from fastapi.middleware.cors import CORSMiddleware
import os
import sqlite3
from datetime import datetime
import calendar


app = FastAPI()

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
    return {"books": []}

@app.get("/daily-sales")
def get_daily_sales(start_date: str = None, end_date: str = None, group_by: str = 'day'):
    cfg = config()
    conn = connect_to_db()

    select_query = select(columns=['date', 'royalty'], start_date=start_date, end_date=end_date)
    df = pd.read_sql_query(select_query, conn)
    conn.close()

    df['date'] = pd.to_datetime(df['date'])

    # Logic to regroup the data
    if group_by == 'week':
        # 'W-MON' groups by weeks starting on Monday
        daily_sum = df.resample('W-MON', on='date')['royalty'].sum()
        last_date = daily_sum.index[-1]
        today = pd.Timestamp(datetime.now().date())

        # 3. Calculate how many days of that week have passed
        # Since 'W-MON' labels the end of the week (Sunday), 
        # we check how many days from the start of that period have elapsed.
        start_of_week = last_date - pd.Timedelta(days=6)
        days_passed = (today - start_of_week).days + 1

        # 4. Apply the linear estimate only if the week is incomplete
        if 0 < days_passed < 7:
            scaling_factor = 7 / days_passed
            daily_sum.iloc[-1] *= scaling_factor


    elif group_by == 'month':
        monthly_sum = df.resample('ME', on='date')['royalty'].sum().to_frame()

        # 2. Get current time context
        # If you are running this on historical data, 'today' should be the max date in your df
        today = pd.Timestamp(datetime.now().date()) 
        last_entry_date = monthly_sum.index[-1]

        # 3. Check if the latest entry is the current, incomplete month
        if last_entry_date.month == today.month and last_entry_date.year == today.year:
            
            # Calculate days passed and total days in this specific month
            days_passed = today.day
            _, total_days_in_month = calendar.monthrange(today.year, today.month)
            
            if days_passed < total_days_in_month:
                scaling_factor = total_days_in_month / days_passed
                
                # Apply the estimate to the last row
                monthly_sum.iloc[-1, monthly_sum.columns.get_loc('royalty')] *= scaling_factor
    else:
        daily_sum = df.groupby('date')['royalty'].sum()

    daily_sum = pd.DataFrame(daily_sum).reset_index()
    daily_sum['date'] = daily_sum['date'].dt.strftime('%Y-%m-%d')
    daily_sum['royalty'] = daily_sum['royalty'].round(2)

    return daily_sum.to_dict(orient='records')

def get_day_week_sales(start_date: str = None, end_date: str = None,):
    cfg = config()
    conn = connect_to_db()


    start_date = "2026-03-01"
    end_date = "2026-06-31"

    select_query = select(columns=['date', 'royalty'], start_date=start_date, end_date=end_date)
    df = pd.read_sql_query(select_query, conn)
    conn.close()

    df['date'] = pd.to_datetime(df['date'])

    result = df.groupby(df['date'].dt.weekday)['royalty'].sum()

    result.index = result.index.map(lambda x: calendar.day_name[x])

#     {'Monday': 145.97,
#  'Tuesday': 190.79999999999998,
#  'Wednesday': 142.52,
#  'Thursday': 81.92,
#  'Friday': 141.28,
#  'Saturday': 100.85,
#  'Sunday': 93.81}

    return result.to_dict()