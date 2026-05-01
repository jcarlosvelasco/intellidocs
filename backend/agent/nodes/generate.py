import json

from langchain_core.messages import AIMessage, ToolMessage

from agent.llm.llm import get_llm_model
from agent.prompts import system_prompt
from agent.state import State


async def generate(state: State):
    """Generates the final response based on the retrieved documents"""
    print("Agent, In generate node")
    messages = state["messages"]

    question = messages[0].content

    tool_messages = [
        msg
        for msg in messages[-5:]
        if (hasattr(msg, "name") and msg.name == "search_documents")
        or isinstance(msg, ToolMessage)
    ]

    documents_with_metadata = []

    for msg in tool_messages:
        try:
            content = (
                json.loads(msg.content) if isinstance(msg.content, str) else msg.content
            )

            if isinstance(content, list):
                for doc in content:
                    documents_with_metadata.append(
                        {
                            "content": doc.get("pageContent", ""),
                            "metadata": doc.get("metadata", {}),
                        }
                    )
        except Exception as e:
            print(f"Error parsing document: {e}")

    context = "\n\n".join(doc["content"] for doc in documents_with_metadata)

    llm = get_llm_model()
    rag_chain = system_prompt | llm

    response = await rag_chain.ainvoke({"context": context, "question": question})

    response_with_sources = AIMessage(
        content=response.content,
        additional_kwargs={
            "sources": [
                {
                    "source": doc["metadata"].get("source", "Unknown"),
                    "page": doc["metadata"].get("page"),
                    "snippet": doc["content"][:200]
                    + ("..." if len(doc["content"]) > 200 else ""),
                }
                for doc in documents_with_metadata
            ]
        },
    )

    return {"messages": [response_with_sources]}
