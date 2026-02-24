from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str
    conversation_id: str


class DeleteRequest(BaseModel):
    source: str
    user_id: str


class GradeDocuments(BaseModel):
    """Esquema para evaluar la relevancia de documentos"""

    binary_score: str = Field(
        description="Documents are relevant to the question, 'yes' or 'no'"
    )


class ProcessResponse(BaseModel):
    success: bool
    message: str
    chunks_created: int
    pages_processed: int
