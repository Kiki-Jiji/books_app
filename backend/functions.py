import os
import sqlite3
import calendar
from datetime import datetime
import pandas as pd
from dotenv import load_dotenv
from models import DailySalesRecord, AdSpendRoyaltyRecord

load_dotenv()


def config():
    return {
        # 'db_name': 'test.db',
        'table_name': 'sales',
        'table_name_ad': 'amazon_ad_data',
        'groups_table_name': 'groups',
        'book_group_table_name': 'book_to_group'
    }



def select(columns, start_date = None, end_date = None, date_column="date", title=None):
    """
    Generates a SQL SELECT statement filtered by a date range.
    
    Args:
        columns (list or str): List of column names or a single string (e.g., "*").
        start_date (str): The beginning of the date range ('YYYY-MM-DD').
        end_date (str): The end of the date range ('YYYY-MM-DD').
        table_name (str): The name of the table to query.
        date_column (str): The name of the date column to filter on.
        
    Returns:
        str: A formatted SQL query string.
    """


    table_name = config()['table_name']
    # Handle columns (list or string)
    if isinstance(columns, list):
        column_string = ", ".join(columns)
    else:
        column_string = columns

    query = f"SELECT {column_string} FROM {table_name}"
    
    # Build conditions dynamically
    conditions = []
    if start_date:
        conditions.append(f"{date_column} >= '{start_date}'")
    if end_date:
        conditions.append(f"{date_column} <= '{end_date}'")
    if title:
        if isinstance(title, list):
            escaped = [t.replace("'", "''") for t in title]
            in_clause = ", ".join(f"'{t}'" for t in escaped)
            conditions.append(f"title IN ({in_clause})")
        else:
            escaped = title.replace("'", "''")
            conditions.append(f"title = '{escaped}'")

    # If we have conditions, append the WHERE clause
    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    return query + ";"




def connect_to_db():

    db_path = os.environ.get('DB_PATH')
    if not db_path:
        raise ValueError("Environment variable 'DB_PATH' is not set. Please set it in backend/.env.")

    # Good practice: Verify the file is actually visible to WSL first
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        print("Connection Successful")
    else:
        print(f"Error: WSL cannot find the file at {db_path}")
        print("Check if the folder name or spelling is slightly different in Linux (case-sensitive!)")
        raise FileNotFoundError(f"WSL cannot find the file at {db_path}")
    return conn


def aggregate_royalties(df, group_by='day'):
    df['date'] = pd.to_datetime(df['date'])

    if group_by == 'week':
        daily_sum = df.resample('W-MON', on='date')['royalty'].sum()
        last_date = daily_sum.index[-1]
        today = pd.Timestamp(datetime.now().date())

        start_of_week = last_date - pd.Timedelta(days=6)
        days_passed = (today - start_of_week).days + 1

        if 0 < days_passed < 7:
            scaling_factor = 7 / days_passed
            daily_sum.iloc[-1] *= scaling_factor

    elif group_by == 'month':
        daily_sum = df.resample('ME', on='date')['royalty'].sum().to_frame()

        today = pd.Timestamp(datetime.now().date())
        last_entry_date = daily_sum.index[-1]

        if last_entry_date.month == today.month and last_entry_date.year == today.year:
            days_passed = today.day
            _, total_days_in_month = calendar.monthrange(today.year, today.month)

            if days_passed < total_days_in_month:
                scaling_factor = total_days_in_month / days_passed
                daily_sum.iloc[-1, daily_sum.columns.get_loc('royalty')] *= scaling_factor
    else:
        daily_sum = df.groupby('date')['royalty'].sum()

    daily_sum = pd.DataFrame(daily_sum).reset_index()
    daily_sum['date'] = daily_sum['date'].dt.strftime('%Y-%m-%d')
    daily_sum['royalty'] = daily_sum['royalty'].round(2)

    return [DailySalesRecord(**r) for r in daily_sum.to_dict(orient='records')]


def ad_spend_vs_royalties(conn, start_date=None, end_date=None, group_by='day'):
    """
    Returns a merged time series of royalties (from the sales table) and ad
    spend / impressions / clicks (from the amazon_ad_data table), aggregated by
    `group_by` ('day' | 'week' | 'month').

    NOTE: Unlike `aggregate_royalties`, this intentionally does NOT scale the
    final partial week/month bucket. For an honest spend-vs-earnings comparison
    we want the actual values in each bucket, not a projected final bucket.
    """
    cfg = config()

    # --- Royalties from the sales table (reuse the shared query builder) ---
    royalties_query = select(columns=['date', 'royalty'], start_date=start_date, end_date=end_date)
    royalties_df = pd.read_sql_query(royalties_query, conn)
    royalties_df['date'] = pd.to_datetime(royalties_df['date'])
    royalties_daily = royalties_df.groupby('date')['royalty'].sum()

    # --- Ad spend / impressions / clicks from the ad table ---
    # Each (date, campaignId) belongs to a single date_collected snapshot, so a
    # plain SUM(cost) GROUP BY date is correct (no snapshot double-counting).
    ad_table = cfg['table_name_ad']
    conditions = []
    if start_date:
        conditions.append(f"date >= '{start_date}'")
    if end_date:
        conditions.append(f"date <= '{end_date}'")
    where_clause = (" WHERE " + " AND ".join(conditions)) if conditions else ""
    ad_query = (
        f"SELECT date, SUM(cost) AS ad_cost, SUM(impressions) AS impressions, "
        f"SUM(clicks) AS clicks FROM {ad_table}{where_clause} GROUP BY date;"
    )
    ad_df = pd.read_sql_query(ad_query, conn)
    ad_df['date'] = pd.to_datetime(ad_df['date'])
    ad_daily = ad_df.set_index('date')[['ad_cost', 'impressions', 'clicks']]

    # --- Merge daily series (outer join keeps spend-only and sales-only days) ---
    merged = pd.concat([royalties_daily, ad_daily], axis=1).fillna(0).sort_index()

    # --- Resample by the requested period (no last-bucket scaling, see note) ---
    if group_by == 'week':
        merged = merged.resample('W-MON').sum()
    elif group_by == 'month':
        merged = merged.resample('ME').sum()
    # 'day' -> already daily

    merged = merged.reset_index()
    merged['date'] = merged['date'].dt.strftime('%Y-%m-%d')

    return [
        AdSpendRoyaltyRecord(
            date=r['date'],
            royalty=round(float(r['royalty']), 2),
            ad_cost=round(float(r['ad_cost']), 2),
            impressions=int(r['impressions']),
            clicks=int(r['clicks']),
        )
        for r in merged.to_dict(orient='records')
    ]
