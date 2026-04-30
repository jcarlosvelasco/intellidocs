from pydantic import BaseModel, Field


class GradeDocuments(BaseModel):
    """Validates document relevancy"""

    binary_score: str = Field(
        description="Documents are relevant to the question, 'yes' or 'no'"
    )
