from langchain_core.messages import HumanMessage

from agent.graph import create_graph


async def invoke_agent(query: str, conversation_id: str) -> dict:
    print("QUERY:", query)
    graph = await create_graph(conversation_id)
    print("Graph built")
    result = await graph.ainvoke(
        {
            "messages": [HumanMessage(content=query)],
            "question": query,
            "documents": [],
            "force_retrieve": False,
        }
    )

    last_message = result["messages"][-1]
    return {"answer": last_message.content, "sources": []}
