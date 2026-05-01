import os

import asyncpg
from fastapi import Depends, FastAPI, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from agent.invoke import invoke_agent
from db.db import create_user_message, update_conversation_status
from db.db_schemas import CreateUserMessageRequest
from files import create_temp_file, remove_temp_file
from pdf import ingest_documents, process_pdf_file
from schema.ChatRequest import ChatRequest
from schema.ChatResponse import ChatResponse
from schema.ProcessPdfInput import ProcessPDFInput
from schema.ProcessResponse import ProcessResponse
from validations.pdf_file import pdf_file
from validations.pdf_input import get_process_pdf_input
from ws_manager import ConnectionManager

app = FastAPI()
manager = ConnectionManager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def get_db_pool():
    if not hasattr(app.state, "pool"):
        app.state.pool = await asyncpg.create_pool(
            os.getenv("ASYNC_DATABASE_URL"), min_size=1, max_size=10
        )
    return app.state.pool


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    print("Chat received!")
    pool = await get_db_pool()
    conversation_id = int(payload.conversation_id)

    await update_conversation_status(pool, conversation_id, "loading")

    response = await invoke_agent(conversation_id=payload.conversation_id)

    message = response["answer"]
    sources = response["sources"]

    request = CreateUserMessageRequest(
        conversationId=conversation_id,
        sources=sources,
        content=message,
        role="assistant",
    )

    stored_message = await create_user_message(pool, request)

    pool = await get_db_pool()
    await update_conversation_status(pool, conversation_id, "idle")

    await manager.notify_done(conversation_id)

    return ChatResponse(
        success=True,
        message=message,
        sources=sources,
        message_id=stored_message["result"]["id"],
        created_at=stored_message["result"]["createdAt"],
        conversation_id=conversation_id,
    )


@app.post("/process-pdf", response_model=ProcessResponse)
async def process_pdf(
    file: UploadFile = Depends(pdf_file),
    data: ProcessPDFInput = Depends(get_process_pdf_input),
):
    temp_file_path = None

    try:
        temp_file_path = create_temp_file(file)
        chunks = process_pdf_file(temp_file_path, data.source_key)
        await ingest_documents(
            chunks, data.user_id, data.conversation_id, data.document_id
        )

        pages_processed = len(set(doc.metadata.get("page", 0) for doc in chunks))

        return ProcessResponse(
            success=True,
            message=f"Successfully processed {file.filename}",
            chunks_created=len(chunks),
            pages_processed=pages_processed,
        )

    finally:
        if temp_file_path:
            remove_temp_file(temp_file_path)


@app.websocket("/ws/conversation/{conversation_id}")
async def conversation_ws(websocket: WebSocket, conversation_id: int):
    await manager.connect(conversation_id, websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(conversation_id, websocket)
