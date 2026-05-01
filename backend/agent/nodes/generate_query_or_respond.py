from agent.llm.llm import get_llm_model
from agent.state import State


def make_generate_query_or_respond(tools: list):
    """Creates the generate query or respond tool"""

    async def generate_query_or_respond(state: State):
        print("Agent, In generateQueryOrRespond node")
        messages = state["messages"]

        model = get_llm_model().bind_tools(tools)

        response = await model.ainvoke(messages)

        print(f"Response from generateQueryOrRespond: {response}")
        return {"messages": [response]}

    return generate_query_or_respond
