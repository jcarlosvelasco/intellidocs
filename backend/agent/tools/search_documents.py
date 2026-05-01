# agent/tools/search_documents.py
import json

from langchain_core.tools import tool

from db.db import retrieve_documents
from embeddings import get_embeddings_model


def make_search_documents_tool(conversation_id: str):
    @tool
    def search_documents(query: str) -> str:
        """Search through uploaded documents to find relevant information."""
        print("Search documents tool called!")
        embeddings_model = get_embeddings_model(
            model_name="BAAI/bge-small-en-v1.5", task="feature-extraction"
        )
        query_embedding = embeddings_model.embed_query(query)
        response = retrieve_documents(
            query_embedding=query_embedding,
            match_count=5,
            filter_json={"conversation_id": conversation_id},
        )
        result = [
            {
                "pageContent": doc.get("content", ""),
                "metadata": {
                    "source": doc.get("metadata", {}).get("source"),
                    "page": doc.get("metadata", {}).get("page"),
                    **doc.get("metadata", {}),
                },
            }
            for doc in response
        ]
        return json.dumps(result)

    return search_documents
