import os

import psycopg
from dotenv import load_dotenv

load_dotenv()

conn_string = os.getenv("DATABASE_URL")
if not conn_string:
    raise ValueError("DATABASE_URL must be set in .env")


def get_conn():
    return psycopg.connect(conn_string)
