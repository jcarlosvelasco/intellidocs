import hashlib
import json
from typing import Any, Dict, List

from asyncpg import Pool

from db.db_schemas import CreateUserMessageRequest
from db.neon_db import get_conn


def insert_documents(rows):
    INSERT_BATCH_SIZE = 100

    total_insert_batches = (len(rows) + INSERT_BATCH_SIZE - 1) // INSERT_BATCH_SIZE

    with get_conn() as conn:
        with conn.cursor() as cur:
            for i in range(0, len(rows), INSERT_BATCH_SIZE):
                batch_num = i // INSERT_BATCH_SIZE + 1
                batch_rows = rows[i : i + INSERT_BATCH_SIZE]

                print(
                    f"Inserting batch {batch_num}/{total_insert_batches} into Neon ({len(batch_rows)} rows)..."
                )

                values = [
                    (
                        hashlib.md5(
                            (r["conversation_id"] + r["content"]).encode()
                        ).hexdigest(),
                        r["content"],
                        json.dumps(r["metadata"]),
                        r["embedding"],
                        r["conversation_id"],
                    )
                    for r in batch_rows
                ]

                cur.executemany(
                    """
                    INSERT INTO documents (id, content, metadata, embedding, conversation_id)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    values,
                )

                print(f"Insert batch {batch_num}/{total_insert_batches} completed")

        conn.commit()

    print(f"Neon: Ingestion complete. Total: {len(rows)} chunks inserted.")


def retrieve_documents(
    query_embedding: list[float],
    match_count: int,
    filter_json: dict,
) -> List[Dict[str, Any]]:
    """
    Calls match_documents(query_embedding, match_count, filter) and returns a list of dicts with id, content, metadata.
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, content, metadata, embedding
                FROM match_documents(%s::vector, %s, %s::jsonb)
                """,
                (query_embedding, match_count, json.dumps(filter_json)),
            )
            rows = cur.fetchall()

    docs = []
    for row in rows:
        doc_id, content, metadata, embedding = row
        docs.append(
            {
                "id": doc_id,
                "content": content,
                "metadata": metadata,
                "embedding": embedding,
            }
        )
    return docs


async def update_conversation_status(pool: Pool, conversation_id: int, status: str):
    async with pool.acquire() as conn:
        await conn.execute(
            """
            UPDATE conversation
            SET status = $1
            WHERE id = $2
            """,
            status,
            conversation_id,
        )


async def create_user_message(
    pool: Pool,
    data: CreateUserMessageRequest,
):
    sources_json = json.dumps([s.dict() for s in data.sources])

    async with pool.acquire() as conn:
        result = await conn.fetchrow(
            """
            INSERT INTO conversation_message
            (conversation_id, role, content, sources)
            VALUES ($1, $2, $3, $4)
            RETURNING id, conversation_id, role, content, created_at, sources
            """,
            data.conversationId,
            data.role,
            data.content,
            sources_json,
        )

        return {
            "success": True,
            "message": "Conversation message created successfully",
            "result": {
                "id": result["id"],
                "conversationId": result["conversation_id"],
                "role": result["role"],
                "content": result["content"],
                "createdAt": result["created_at"].isoformat(),
                "sources": json.loads(result["sources"]) if result["sources"] else [],
            },
        }
