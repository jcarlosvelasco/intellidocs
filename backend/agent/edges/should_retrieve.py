from langchain_core.messages import AIMessage
from langgraph.constants import END

from agent.state import State


def should_retrieve(state: State) -> str:
    """Si el LLM hizo tool_call → recuperar. Si no → END."""
    last_message = state["messages"][-1]
    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        print("Decision: retrieve documents")
        return "retrieve"
    print("Decision: respond directly")
    return END
