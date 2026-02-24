from typing import List, Optional

from pydantic import BaseModel, Field


class Source(BaseModel):
    source: str
    page: Optional[int] = None
    snippet: str


class CreateUserMessageRequest(BaseModel):
    content: str = Field(min_length=1)
    conversationId: int
    role: str = "user"
    sources: List[Source] = Field(default_factory=list)
