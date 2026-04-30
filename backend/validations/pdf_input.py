from fastapi import Form

from schema.ProcessPdfInput import ProcessPDFInput


def get_process_pdf_input(
    user_id: str = Form(...),
    source_key: str = Form(...),
    conversation_id: str = Form(...),
    document_id: int = Form(...),
) -> ProcessPDFInput:
    return ProcessPDFInput(
        user_id=user_id,
        source_key=source_key,
        conversation_id=conversation_id,
        document_id=document_id,
    )
