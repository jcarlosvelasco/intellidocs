from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode

from agent.edges.should_generate_or_rewrite import should_generate_or_rewrite
from agent.edges.should_retrieve import should_retrieve
from agent.nodes.generate import generate
from agent.nodes.generate_query_or_respond import make_generate_query_or_respond
from agent.nodes.grade_documents import grade_documents
from agent.nodes.rewrite import rewrite
from agent.state import State
from agent.tools.search_documents import make_search_documents_tool


async def create_graph(conversation_id: str):
    search_documents = make_search_documents_tool(conversation_id)
    tools = [search_documents]
    tool_node = ToolNode(tools)

    builder = StateGraph(State)

    builder.add_node("generateQueryOrRespond", make_generate_query_or_respond(tools))
    builder.add_node("retrieve", tool_node)
    builder.add_node("gradeDocuments", grade_documents)
    builder.add_node("rewrite", rewrite)
    builder.add_node("generate", generate)

    builder.add_edge(START, "generateQueryOrRespond")
    builder.add_conditional_edges(
        "generateQueryOrRespond", should_retrieve, {"retrieve": "retrieve", END: END}
    )
    builder.add_edge("retrieve", "gradeDocuments")
    builder.add_conditional_edges(
        "gradeDocuments",
        should_generate_or_rewrite,
        {"generate": "generate", "rewrite": "rewrite"},
    )
    builder.add_edge("generate", END)
    builder.add_edge("rewrite", "generateQueryOrRespond")

    return builder.compile()
