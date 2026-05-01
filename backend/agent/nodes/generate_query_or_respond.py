from langchain_core.messages import SystemMessage

from agent.llm.llm import get_llm_model
from agent.prompts import system_prompt
from agent.state import State

# Keywords that indicate the user is asking about documents
DOCUMENT_KEYWORDS = {
    "file",
    "upload",
    "uploaded",
    "the document",
    "my document",
    "document uploaded",
    "what's in",
    "what is in",
    "qué hay en",
    "from the document",
    "from the file",
    "el documento",
    "el archivo",
}


def should_force_retrieve(query: str) -> bool:
    """Detects if the query mentions a document."""
    query_lower = query.lower()
    # Buscar palabras clave
    for keyword in DOCUMENT_KEYWORDS:
        if keyword in query_lower:
            print(f"[FORCE RETRIEVE] Keyword detected: '{keyword}'")
            return True
    return False


def make_generate_query_or_respond(tools: list):
    print("Generate query or respond node initialized")
    llm = get_llm_model(model="openrouter/owl-alpha", temperature=0.1)
    llm_with_tools = llm.bind_tools(tools)

    async def generate_query_or_respond(state: State) -> dict:
        """Decide if we need to search documents.

        First, check if the query mentions documents (force retrieve).
        If not, let the LLM decide if it needs to call tools.
        """
        query = state["question"]

        # Check if we should force retrieve based on keywords
        force_retrieve = should_force_retrieve(query)

        if force_retrieve:
            print("[AGENT] Detected document mention - forcing document search")
            # Create a tool call for search_documents
            return {
                "messages": [],  # Don't add any message yet
                "force_retrieve": True,
            }

        # Otherwise, let the LLM decide
        messages = [SystemMessage(content=system_prompt)] + state["messages"]
        response = await llm_with_tools.ainvoke(messages)

        return {"messages": [response], "force_retrieve": False}

    return generate_query_or_respond
