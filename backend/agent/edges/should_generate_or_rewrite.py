from agent.state import State


def should_generate_or_rewrite(state: State) -> str:
    """If docs are relevant, generate. If not, rewrite."""
    grade = state.get("grade", "no")
    if grade == "yes":
        print("Decision: generate response")
        return "generate"
    print("Decision: rewrite query")
    return "rewrite"
