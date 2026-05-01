from agent.llm.llm import get_llm_model
from agent.prompts import generate_prompt
from agent.state import State


async def generate(state: State) -> dict:
    """Generates final answer using the documents."""
    print("Generating response...")
    question = state["question"]
    documents = state.get("documents", [])

    if not documents:
        context = "No documents found"
    elif isinstance(documents, list):
        context = "\n\n".join([str(d) for d in documents if d])
    else:
        context = str(documents)

    print(f"Generating with context: {context[:200]}...")

    llm = get_llm_model(model="openrouter/owl-alpha", temperature=0.1)
    chain = generate_prompt | llm
    response = await chain.ainvoke({"question": question, "context": context})
    from langchain_core.messages import AIMessage

    return {"messages": [AIMessage(content=response.content)]}
