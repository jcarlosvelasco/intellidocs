from agent.llm.llm import get_llm_model
from agent.prompts import rewrite_prompt
from agent.state import State


async def rewrite(state: State) -> dict:
    """Reescribe la query para mejorar la búsqueda."""
    print("Rewriting query...")
    question = state["question"]
    llm = get_llm_model(model="openrouter/owl-alpha", temperature=0.1)
    chain = rewrite_prompt | llm
    response = await chain.ainvoke({"question": question})

    # Reemplaza el último HumanMessage con la query mejorada
    from langchain_core.messages import HumanMessage

    return {"messages": [HumanMessage(content=response.content)]}
