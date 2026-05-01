from typing import Literal

from langchain_core.messages import AIMessage
from langgraph.graph import END

from agent.state import State


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
