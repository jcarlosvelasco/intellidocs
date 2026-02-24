import json
import os
from typing import Any, Dict, List

from langchain_core.tools import tool
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from pydantic import BaseModel, Field

from db.neon import get_conn


class SearchDocumentsInput(BaseModel):
    """Input para la herramienta de búsqueda de documentos"""

    query: str = Field(description="The search query to find relevant documents")


async def get_retriever_tool(conversation_id: str):
    """Crea la herramienta de recuperación de documentos"""
    print(
        f"Retriever, Supabase: Setting up retriever tool with conversation ID: {conversation_id}"
    )

    hugging_face_key = os.getenv("HUGGINGFACEHUB_API_KEY")
    if not hugging_face_key:
        raise ValueError("Hugging Face API key not found")

    embeddings = HuggingFaceEndpointEmbeddings(
        model="BAAI/bge-small-en-v1.5",
        task="feature-extraction",
        huggingfacehub_api_token=hugging_face_key,
    )

    print("Embeddings model loaded!")

    @tool("search_documents", args_schema=SearchDocumentsInput)
    def search_documents_tool(query: str) -> str:
        """Search through uploaded documents to find relevant information."""
        try:
            print(f"Retriever, Searching documents with query: {query}")

            query_embedding = embeddings.embed_query(query)
            print(f"Query embedding generated, dimension: {len(query_embedding)}")

            response = retrieve_documents(
                query_embedding=query_embedding,
                match_count=5,
                filter_json={"conversation_id": conversation_id},
            )

            print(f"Retriever, Found {len(response)} documents")

            if response:
                print(
                    f"Sample metadata: {json.dumps(response[0].get('metadata', {}), indent=2)}"
                )

            result = [
                {
                    "pageContent": doc.get("content", ""),
                    "metadata": {
                        "source": doc.get("metadata", {}).get("source"),
                        "page": doc.get("metadata", {}).get("page"),
                        "total_pages": doc.get("metadata", {}).get("total_pages"),
                        "chunk_index": doc.get("metadata", {}).get("chunk_index"),
                        "preview": doc.get("metadata", {}).get("preview"),
                        **doc.get("metadata", {}),
                    },
                }
                for doc in response
            ]

            return json.dumps(result)

        except Exception as e:
            print(f"Retriever ERROR: {type(e).__name__}: {str(e)}")
            import traceback

            traceback.print_exc()

            return json.dumps([])

    return search_documents_tool


def retrieve_documents(
    query_embedding: list[float],
    match_count: int,
    filter_json: dict,
) -> List[Dict[str, Any]]:
    """
    Llama a la función match_documents(query_embedding, match_count, filter)
    y devuelve una lista de dicts con id, content, metadata.
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, content, metadata, embedding
                FROM match_documents(%s::vector, %s, %s::jsonb)
                """,
                (query_embedding, match_count, json.dumps(filter_json)),
            )
            rows = cur.fetchall()

    docs = []
    for row in rows:
        doc_id, content, metadata, embedding = row
        docs.append(
            {
                "id": doc_id,
                "content": content,
                "metadata": metadata,
                "embedding": embedding,
            }
        )
    return docs
