from typing import List

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

from db.db import insert_documents
from embeddings import get_embeddings_model


def process_pdf_file(file_path: str, source_name: str) -> List[Document]:
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
    BATCH_SIZE = 50

    try:
        print(f"PDF, Creating embeddings for {len(docs)} chunks...")

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

        all_embeddings = []

        total_batches = (len(texts_to_embed) + BATCH_SIZE - 1) // BATCH_SIZE

        embeddings_model = get_embeddings_model(
            model_name="BAAI/bge-small-en-v1.5", task="feature-extraction"
        )

        for i in range(0, len(texts_to_embed), BATCH_SIZE):
            batch_num = i // BATCH_SIZE + 1
            batch_texts = texts_to_embed[i : i + BATCH_SIZE]

            print(
                f"Generating embeddings for batch {batch_num}/{total_batches} ({len(batch_texts)} chunks)..."
            )
            batch_embeddings = embeddings_model.embed_documents(batch_texts)
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
