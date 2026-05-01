from agent.llm.llm import get_llm_model
from agent.prompts import generate_prompt
from agent.state import State


async def generate(state: State) -> dict:
    """Genera la respuesta final usando los documentos."""
    print("Generating response...")
    question = state["question"]
    documents = state["documents"]
    llm = get_llm_model(model="openrouter/owl-alpha", temperature=0.1)
    chain = generate_prompt | llm
    response = await chain.ainvoke(
        {"question": question, "context": "\n\n".join(documents)}
    )
    from langchain_core.messages import AIMessage

    return {"messages": [AIMessage(content=response.content)]}
