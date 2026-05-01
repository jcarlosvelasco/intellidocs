from langchain_core.messages import AIMessage
from langgraph.constants import END

from agent.state import State


def should_retrieve(state: State) -> str:
    """Decides whether to retrieve documents based on the state.
    Cases:
        1.force_retrive: go to retrieve
        2.last message is AIMessage with tool_calls: go to retrieve
        3. In other case: END
    """
    if state.get("force_retrieve", False):
        print("[EDGE] Force retrieve flag is True - going to retrieve")
        return "retrieve"

    last_message = state["messages"][-1] if state["messages"] else None
    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        print("[EDGE] Tool calls detected - going to retrieve")
        return "retrieve"

    print("[EDGE] No tool calls and no force flag - ending")
    return END
