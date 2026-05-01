from typing import Literal

from agent.state import State


def should_generate_or_rewrite(state: State) -> Literal["generate", "rewrite"]:
    """Determines whether to generate or rewrite"""
    messages = state["messages"]
    last_message = messages[-1]

    if last_message is None:
        raise ValueError("No messages found in state")

    return "generate" if last_message.content == "generate" else "rewrite"
