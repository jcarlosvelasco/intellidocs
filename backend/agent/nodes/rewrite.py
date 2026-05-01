from langchain_core.messages import HumanMessage

from agent.llm.llm import get_llm_model
from agent.prompts import rewrite_prompt
from agent.state import State


async def rewrite(state: State):
    """Rewrites the question to improve the search"""
    print("Agent, In rewrite node")
    messages = state["messages"]

    question = messages[0].content

    model = get_llm_model(temperature=0.1)
    response = await (rewrite_prompt | model).ainvoke({"question": question})

    new_messages = messages.copy()
    new_messages[0] = HumanMessage(
        content=response.content,
        additional_kwargs={"original_question": question, "rewritten": True},
    )

    return {"messages": new_messages}
