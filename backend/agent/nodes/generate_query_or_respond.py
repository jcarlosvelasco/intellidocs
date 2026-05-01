from langchain_core.messages import SystemMessage

from agent.llm.llm import get_llm_model
from agent.prompts import system_prompt
from agent.state import State


def make_generate_query_or_respond(tools: list):
    llm = get_llm_model(model="openrouter/owl-alpha", temperature=0.1)
    llm_with_tools = llm.bind_tools(tools)

    async def generate_query_or_respond(state: State) -> dict:
        """Decide si buscar documentos o responder directamente."""
        messages = [SystemMessage(content=system_prompt)] + state["messages"]
        response = await llm_with_tools.ainvoke(messages)
        return {"messages": [response]}

    return generate_query_or_respond
