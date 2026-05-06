# Book App Backend

This is the backend for the book app, built with FastAPI.

## Setup

1. Ensure you have Python installed.
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment: `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`

## Database

The app uses SQLite database `test.db`. Ensure the database is set up with the sales data.

## Running the Server

Use the provided `server.bat` batch file to manage the server:

- **Start the server**: `server.bat start`
- **Stop the server**: `server.bat stop`
- **Check server status**: `server.bat status`

The server runs on `http://127.0.0.1:8000` with auto-reload enabled.

## API Endpoints

- `GET /`: Returns a hello message.
- `GET /books`: Returns a list of books (placeholder).
- `GET /daily-sales`: Returns daily sales data. Optional query parameters:
  - `start_date`: Filter from this date (YYYY-MM-DD)
  - `end_date`: Filter to this date (YYYY-MM-DD)

Example: `http://127.0.0.1:8000/daily-sales?start_date=2026-01-01&end_date=2026-01-31`

## Manual Server Start

If you prefer to start manually:

1. Activate the virtual environment.
2. Run: `uvicorn main:app --reload`

## Stopping Manually

Press Ctrl+C in the terminal where the server is running.