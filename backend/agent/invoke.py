from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from agent.graph import create_graph
from db.conversation_history import get_conversation_messages

ROLE_MAP = {
    "user": HumanMessage,
    "assistant": AIMessage,
    "system": SystemMessage,
}


async def invoke_agent(conversation_id: str) -> dict:
    history = await get_conversation_messages(int(conversation_id))
    history_messages = [
        ROLE_MAP[msg["role"]](content=msg["content"])
        for msg in history
        if msg["role"] in ROLE_MAP
    ]

    print("History:", history_messages)

    graph = await create_graph(conversation_id)
    result = await graph.ainvoke(
        {
            "messages": history_messages,
        }
    )

    last_message = result["messages"][-1]

    return {"answer": last_message.content, "sources": []}
