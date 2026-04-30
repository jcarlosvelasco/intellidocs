from langchain_core.output_parsers import StrOutputParser
from langchain_core.tools import tool

from agent.llm.local_llm import get_local_llm
from agent.prompts import rewrite_prompt


@tool
def rewrite(query: str) -> str:
    """Rewrite the user's query to be more concise and focused."""

    print("Rewrite tool called!")

    model = get_local_llm(model="gemma4:e2b", temperature=0.2)

    chain = rewrite_prompt | model | StrOutputParser()
    return chain.invoke({"query": query})
