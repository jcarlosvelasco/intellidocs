from typing import List

from pydantic import BaseModel

from db.db_schemas import Source


class ChatResponse(BaseModel):
    success: bool
    message: str
    sources: List[Source] = []
    message_id: int
    created_at: str
    conversation_id: int
