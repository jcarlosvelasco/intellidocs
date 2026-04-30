from pydantic import BaseModel


class ProcessResponse(BaseModel):
    success: bool
    message: str
    chunks_created: int
    pages_processed: int
