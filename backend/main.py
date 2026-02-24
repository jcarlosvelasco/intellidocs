import hashlib
import json
import os
import shutil
import tempfile
from typing import List

import asyncpg
from dotenv import load_dotenv
from fastapi import (
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

from agent.agent import ChatResponse, create_graph
from db.neon import get_conn
from db_schemas import CreateUserMessageRequest
from schemas import ChatRequest, ProcessResponse
from ws_manager import ConnectionManager

manager = ConnectionManager()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://intellidocs-pearl.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACEHUB_API_KEY") or ""

embeddings = HuggingFaceEndpointEmbeddings(
    model="BAAI/bge-small-en-v1.5", huggingfacehub_api_token=HUGGINGFACE_API_KEY
)

INSERT_BATCH_SIZE = 100


def process_pdf_file(file_path: str, source_name: str) -> List[Document]:
    """
    Procesa un archivo PDF y lo convierte en documentos de LangChain.
    Cada página se trata como un documento separado.
    """
    try:
        print(f"PDFProcessor: Processing file at {file_path}")

        reader = PdfReader(file_path)
        num_pages = len(reader.pages)

        pdf_metadata = {}
        if reader.metadata:
            pdf_metadata = {
                "title": reader.metadata.get("/Title", ""),
                "author": reader.metadata.get("/Author", ""),
                "subject": reader.metadata.get("/Subject", ""),
                "creator": reader.metadata.get("/Creator", ""),
            }

        page_documents = []
        for page_num, page in enumerate(reader.pages, start=1):
            page_text = page.extract_text().strip()

            if page_text:
                page_doc = Document(
                    page_content=page_text,
                    metadata={
                        "source": source_name,
                        "page": page_num,
                        "total_pages": num_pages,
                        **pdf_metadata,
                    },
                )
                page_documents.append(page_doc)

        print(f"PDFProcessor: Extracted {len(page_documents)} pages from PDF")

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )
        split_docs = splitter.split_documents(page_documents)

        enriched_docs = []
        for index, doc in enumerate(split_docs):
            doc.metadata.update(
                {
                    "chunk_index": index,
                    "total_chunks": len(split_docs),
                    "preview": doc.page_content[:100] + "...",
                    "character_count": len(doc.page_content),
                }
            )
            enriched_docs.append(doc)

        print(
            f"PDFProcessor: Created {len(enriched_docs)} chunks from {len(page_documents)} pages"
        )

        return enriched_docs

    except Exception as e:
        print(f"PDFProcessor Error: Failed to process {file_path}: {str(e)}")
        raise


async def ingest_documents(
    docs: List[Document], user_id: str, conversation_id: str, document_id: int
):
    """
    Ingesta documentos en Supabase con embeddings (optimizado con batch processing).
    """
    try:
        print(f"Retriever, Supabase: Ingesting {len(docs)} chunks...")

        enriched_docs = []
        texts_to_embed = []

        for index, doc in enumerate(docs):
            metadata = doc.metadata or {}
            metadata.update(
                {
                    "chunk_id": f"{metadata.get('source', 'unknown')}_chunk_{index}",
                    "user_id": user_id,
                    "conversation_id": conversation_id,
                    "document_id": document_id,
                }
            )
            enriched_docs.append((doc.page_content, metadata))
            texts_to_embed.append(doc.page_content)

        BATCH_SIZE = 50
        all_embeddings = []

        total_batches = (len(texts_to_embed) + BATCH_SIZE - 1) // BATCH_SIZE

        for i in range(0, len(texts_to_embed), BATCH_SIZE):
            batch_num = i // BATCH_SIZE + 1
            batch_texts = texts_to_embed[i : i + BATCH_SIZE]

            print(
                f"Generating embeddings for batch {batch_num}/{total_batches} ({len(batch_texts)} chunks)..."
            )
            batch_embeddings = embeddings.embed_documents(batch_texts)
            all_embeddings.extend(batch_embeddings)

            print(f"Batch {batch_num}/{total_batches} completed")

        print(f"All {len(all_embeddings)} embeddings generated successfully")

        rows = []
        for (content, metadata), embedding in zip(enriched_docs, all_embeddings):
            rows.append(
                {
                    "content": content,
                    "embedding": embedding,
                    "metadata": metadata,
                    "conversation_id": conversation_id,
                }
            )

        insert_documents(rows)
        print(f"Supabase: Ingestion complete. Total: {len(rows)} chunks inserted.")

    except Exception as e:
        print(f"Error during ingestion: {str(e)}")
        raise


@app.post("/process-pdf", response_model=ProcessResponse)
async def process_pdf(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    source_key: str = Form(...),
    conversation_id: str = Form(...),
    document_id: int = Form(...),
):
    """
    Endpoint para procesar un PDF y crear embeddings.

    Args:
        file: Archivo PDF
        user_id: ID del usuario
        source_key: Clave única del archivo (formato: timestamp-filename)
    """

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    temp_dir = tempfile.mkdtemp()
    temp_file_path = os.path.join(temp_dir, file.filename)

    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        chunks = process_pdf_file(temp_file_path, source_key)

        await ingest_documents(chunks, user_id, conversation_id, document_id)

        pages_processed = len(set(doc.metadata.get("page", 0) for doc in chunks))

        return ProcessResponse(
            success=True,
            message=f"Successfully processed {file.filename}",
            chunks_created=len(chunks),
            pages_processed=pages_processed,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

    finally:
        try:
            shutil.rmtree(temp_dir)
        except Exception as e:
            print(f"Warning: Failed to clean temp directory: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "pdf-processing"}


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    try:
        print("Setting status to loading...")
        await update_conversation_status(int(payload.conversation_id), "loading")
        print("Status set to loading.")

        print("Creating graph...")
        graph = await create_graph(payload.conversation_id)
        print("Graph created!")

        print("Invoking message...")
        result = await graph.ainvoke(
            {"messages": [HumanMessage(content=payload.query)]}
        )

        last_message = result["messages"][-1]

        sources = None
        if hasattr(last_message, "additional_kwargs"):
            sources = last_message.additional_kwargs.get("sources") or []

        print("Storing result in db...")

        request = CreateUserMessageRequest(
            conversationId=int(payload.conversation_id),
            sources=sources,
            content=str(last_message.content),
            role="assistant",
        )

        stored_message = await create_user_message(request)

        print("Stored result in db!")

        print("Settings status to idle...")
        await update_conversation_status(int(payload.conversation_id), "idle")
        print("Status set to idle.")

        print("Sending notification...")
        await manager.notify_done(int(payload.conversation_id))

        return ChatResponse(
            success=True,
            message=str(last_message.content),
            sources=sources,
            message_id=stored_message["result"]["id"],
            created_at=stored_message["result"]["createdAt"],
            conversation_id=int(payload.conversation_id),
        )

    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


async def get_db_pool():
    if not hasattr(app.state, "pool"):
        app.state.pool = await asyncpg.create_pool(
            os.getenv("ASYNC_DATABASE_URL"), min_size=1, max_size=10
        )
    return app.state.pool


async def create_user_message(
    data: CreateUserMessageRequest,
):
    pool = await get_db_pool()

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


async def update_conversation_status(conversation_id: int, status: str):
    pool = await get_db_pool()

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


@app.websocket("/ws/conversation/{conversation_id}")
async def conversation_ws(websocket: WebSocket, conversation_id: int):
    await manager.connect(conversation_id, websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(conversation_id, websocket)


def insert_documents(rows):
    total_insert_batches = (len(rows) + INSERT_BATCH_SIZE - 1) // INSERT_BATCH_SIZE

    with get_conn() as conn:
        with conn.cursor() as cur:
            for i in range(0, len(rows), INSERT_BATCH_SIZE):
                batch_num = i // INSERT_BATCH_SIZE + 1
                batch_rows = rows[i : i + INSERT_BATCH_SIZE]

                print(
                    f"Inserting batch {batch_num}/{total_insert_batches} into Neon ({len(batch_rows)} rows)..."
                )

                # Convertimos rows (dict) a tuplas en el orden de columnas de la tabla
                values = [
                    (
                        hashlib.md5(
                            (r["conversation_id"] + r["content"]).encode()
                        ).hexdigest(),
                        r["content"],
                        json.dumps(r["metadata"]),  # dict → psycopg lo castea a jsonb
                        r["embedding"],  # lista de floats → vector
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
