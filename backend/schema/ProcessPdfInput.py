from pydantic import BaseModel


class ProcessPDFInput(BaseModel):
    user_id: str
    source_key: str
    conversation_id: str
    document_id: int
