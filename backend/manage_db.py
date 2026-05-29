
from functions import config, connect_to_db

# create groups table and book_to_group table

def create_group_table():
    cfg = config()
    conn = connect_to_db()
    cursor = conn.cursor()

    cursor.executescript(f"""
    CREATE TABLE IF NOT EXISTS {cfg['groups_table_name']} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS {cfg['book_group_table_name']} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book TEXT NOT NULL,
        group_id INTEGER NOT NULL,
        FOREIGN KEY (group_id) REFERENCES {cfg['groups_table_name']}(id)
    );
    """)
    conn.commit()
    conn.close()


def migrate_groups_add_image():
    """Add image_path column to groups table if it doesn't already exist."""
    cfg = config()
    conn = connect_to_db()
    cursor = conn.cursor()
    try:
        cursor.execute(f"ALTER TABLE {cfg['groups_table_name']} ADD COLUMN image_path TEXT;")
        conn.commit()
    except Exception:
        pass  # Column already exists
    finally:
        conn.close()


def delete_group_table():
    cfg = config()
    conn = connect_to_db()
    cursor = conn.cursor()

    cursor.executescript(f"""
    DROP TABLE IF EXISTS {cfg['book_group_table_name']};
    DROP TABLE IF EXISTS {cfg['groups_table_name']};
    """)
    conn.commit()
    conn.close()

