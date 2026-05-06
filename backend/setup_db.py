import sqlite3
import os






def connect_to_db(db_path):

    # WSL path translation
    db_path = "/mnt/c/Users/joshu/Documents/code/books2/test.db"

    # Good practice: Verify the file is actually visible to WSL first
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        print("Connection Successful")
    else:
        print(f"Error: WSL cannot find the file at {db_path}")
        print("Check if the folder name or spelling is slightly different in Linux (case-sensitive!)")
    return conn



# config = config()
# db_name = config['db_name']
# table_name = config['table_name']


# # 1. Load your CSV data
# csv_file = './combined_sales.csv'
# df = pd.read_csv(csv_file)

# df.columns = [i.lower().replace(' ', '_') for i in df.columns]

# df['royalty_date'] = pd.to_datetime(df['royalty_date'], errors='coerce')

# df.rename(columns={'royalty_date': 'date'}, inplace=True)

# # 2. Connect to (or create) the SQLite database
# conn = sqlite3.connect(db_name)

# # # 3. Write the data to a new table
# # # 'if_exists' can be 'fail', 'replace', or 'append'
# # df.to_sql(table_name, conn, if_exists='replace', index=False)

# # # 4. Close the connection
# # conn.close()
# # print("Database created successfully!")

# # test



# config = config()
# db_name = config['db_name']
# table_name = config['table_name']


# # 1. Connect to the database
# conn = sqlite3.connect(db_name)

# select_query = select(columns=['date', 'royalty'],)
# print(select_query)
# df = pd.read_sql_query(select_query, conn)

# conn.close()

# # 4. Close connection


# ##############

# available_cols = ['date', 'title', 'author_name', 'asin/isbn', 'marketplace',
#        'royalty_type', 'transaction_type', 'units_sold', 'units_refunded',
#        'net_units_sold', 'avg._list_price_without_tax',
#        'avg._offer_price_without_tax', 'avg._delivery/manufacturing_cost',
#        'royalty', 'currency']

# df['date'] = pd.to_datetime(df['date'], errors='coerce')

# daily_sum = df.groupby('date')['royalty'].sum()
# daily_sum = pd.DataFrame(daily_sum).reset_index()
# daily_sum['date'] = daily_sum['date'].astype(str)

# daily_sum['royalty'] = daily_sum['royalty'].round(2)

# daily_sum.to_dict(orient='records')