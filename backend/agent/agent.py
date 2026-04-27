import json
from typing import Annotated, List, Literal, Optional, TypedDict

from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from pydantic import BaseModel

from agent.prompts import grade_documents_prompt, rewrite_prompt, system_prompt
from agent.retriever import get_retriever_tool
from llm_gateway import get_llm_model, run_chain_with_fallback
from schemas import GradeDocuments


class Source(BaseModel):
    source: str
    page: Optional[int]
    snippet: str


class ChatResponse(BaseModel):
    success: bool
    message: str
    sources: List[Source] = []
    message_id: int
    created_at: str
    conversation_id: int


class State(TypedDict):
    messages: Annotated[list, add_messages]


def make_generate_query_or_respond(tools: list):
    """Creates the generate query or respond tool"""

    async def generate_query_or_respond(state: State):
        print("Agent, In generateQueryOrRespond node")
        messages = state["messages"]

        print("Getting model...")
        try:
            # Try the preferred model client and bind tools as before
            model = get_llm_model().bind_tools(tools)
            print("Got model!")
            response = await model.ainvoke(messages)
        except Exception as e:
            # If the primary model invocation fails (rate limits, unavailable endpoints, etc.)
            # fall back to the run_chain_with_fallback helper that retries and cascades across models.
            print(
                f"Primary model invocation failed: {e}. Falling back to run_chain_with_fallback."
            )
            # Attempt cross-model invocation; pass the same messages and the tools so bound tool calls work.
            response = await run_chain_with_fallback(messages, tools=tools)

        print(f"Response from generateQueryOrRespond: {response}")
        return {"messages": [response]}

    return generate_query_or_respond


async def grade_documents(state: State):
    """Evaluates if the retrieved documents are relevant"""
    print("Agent, In gradeDocuments node")
    messages = state["messages"]

    model = get_llm_model().with_structured_output(GradeDocuments)

    question = messages[0].content
    context = messages[-1].content

    # Build a bound chain first and let run_chain_with_fallback try it, falling back across models on failure
    chain = grade_documents_prompt | model
    score = await run_chain_with_fallback(
        (chain, {"question": question, "context": context})
    )

    decision_message = AIMessage(
        content="generate" if score.binary_score == "yes" else "rewrite",
        name="grader_decision",
    )

    return {"messages": [decision_message]}


async def rewrite(state: State):
    """Rewrites the question to improve the search"""
    print("Agent, In rewrite node")
    messages = state["messages"]

    question = messages[0].content

    # Use run_chain_with_fallback so we can retry and cascade through fallback models on transient errors
    response = await run_chain_with_fallback((rewrite_prompt, {"question": question}))

    new_messages = messages.copy()
    new_messages[0] = HumanMessage(
        content=response.content,
        additional_kwargs={"original_question": question, "rewritten": True},
    )

    return {"messages": new_messages}


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

    # Invoke the system prompt + LLM via run_chain_with_fallback (handles retries/fallbacks)
    response = await run_chain_with_fallback(
        (system_prompt, {"context": context, "question": question})
    )

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


def should_retrieve(state: State) -> Literal["retrieve", "__end__"]:
    """Determines whether to retrieve documents"""
    print("Agent, Deciding whether to retrieve")
    messages = state["messages"]
    last_message = messages[-1]

    if (
        isinstance(last_message, AIMessage)
        and hasattr(last_message, "tool_calls")
        and last_message.tool_calls
    ):
        return "retrieve"

    return END


def should_generate_or_rewrite(state: State) -> Literal["generate", "rewrite"]:
    """Determines whether to generate or rewrite"""
    messages = state["messages"]
    last_message = messages[-1]

    if last_message is None:
        raise ValueError("No messages found in state")

    return "generate" if last_message.content == "generate" else "rewrite"


async def create_graph(conversation_id: str):
    """Creates and compiles the agent graph"""
    retriever_tool = await get_retriever_tool(conversation_id)
    tools = [retriever_tool]

    tool_node = ToolNode(tools)

    builder = StateGraph(State)

    builder.add_node("generateQueryOrRespond", make_generate_query_or_respond(tools))
    builder.add_node("retrieve", tool_node)
    builder.add_node("gradeDocuments", grade_documents)
    builder.add_node("rewrite", rewrite)
    builder.add_node("generate", generate)

    builder.add_edge(START, "generateQueryOrRespond")
    builder.add_conditional_edges("generateQueryOrRespond", should_retrieve)
    builder.add_edge("retrieve", "gradeDocuments")
    builder.add_conditional_edges("gradeDocuments", should_generate_or_rewrite)
    builder.add_edge("generate", END)
    builder.add_edge("rewrite", "generateQueryOrRespond")

    return builder.compile()
