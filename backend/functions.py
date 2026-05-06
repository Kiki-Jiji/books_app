import os
import sqlite3


def config():
    return {
        'db_name': 'test.db',
        'table_name': 'sales',
        'db_path': "/mnt/c/Users/joshu/Documents/code/books2/test.db",
    }



def select(columns, start_date = None, end_date = None, date_column="date"):
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

    # If we have conditions, append the WHERE clause
    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    return query + ";"




def connect_to_db():

    # WSL path translation
    db_path = config()['db_path']

    # Good practice: Verify the file is actually visible to WSL first
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        print("Connection Successful")
    else:
        print(f"Error: WSL cannot find the file at {db_path}")
        print("Check if the folder name or spelling is slightly different in Linux (case-sensitive!)")
    return conn
