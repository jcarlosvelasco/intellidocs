import json
import traceback

from langchain_core.tools import tool
from pydantic import BaseModel, Field

from db.db import retrieve_documents
from embeddings import get_embeddings_model


class SearchDocumentsInput(BaseModel):
    """Input for the document search tool"""

    query: str = Field(description="The search query to find relevant documents")


async def get_retriever_tool(conversation_id: str):
    """Creates the document retrieval tool"""
    print(
        f"Retriever, Supabase: Setting up retriever tool with conversation ID: {conversation_id}"
    )

    embeddings = get_embeddings_model(
        model_name="BAAI/bge-small-en-v1.5", task="feature-extraction"
    )

    print("Embeddings model loaded!")

    @tool("search_documents", args_schema=SearchDocumentsInput)
    def search_documents_tool(query: str) -> str:
        """Search through uploaded documents to find relevant information."""
        try:
            query_embedding = embeddings.embed_query(query)

            response = retrieve_documents(
                query_embedding=query_embedding,
                match_count=5,
                filter_json={"conversation_id": conversation_id},
            )

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

            traceback.print_exc()

            return json.dumps([])

    return search_documents_tool
