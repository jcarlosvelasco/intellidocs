import os

import asyncpg


async def get_conversation_messages(conversation_id: int) -> list[dict]:
    conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
    try:
        rows = await conn.fetch(
            """
            SELECT role, content
            FROM conversation_message
            WHERE conversation_id = $1
            ORDER BY created_at ASC
            """,
            conversation_id,
        )
        return [dict(row) for row in rows]
    finally:
        await conn.close()


async def save_message(conversation_id: int, role: str, content: str, sources=None):
    conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
    try:
        await conn.execute(
            """
            INSERT INTO conversation_message (conversation_id, role, content, sources)
            VALUES ($1, $2, $3, $4)
            """,
            conversation_id,
            role,
            content,
            sources,
        )
    finally:
        await conn.close()
