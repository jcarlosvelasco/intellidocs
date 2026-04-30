from langchain.agents import create_agent

from agent.llm.llm import get_llm_model
from agent.llm.local_llm import get_local_llm
from agent.prompts import system_prompt
from agent.tools.grade_documents import grade_documents_tool
from agent.tools.rewrite import rewrite
from agent.tools.search_documents import search_documents

tools = [search_documents, rewrite, grade_documents_tool]
llm = get_llm_model(model="openrouter/owl-alpha", temperature=0.1)
local_llm = get_local_llm(model="gemma4:e2b", temperature=0.2)

agent = create_agent(model=llm, tools=tools, system_prompt=system_prompt)


def generate_response(question: str, messages: list) -> dict:
    last_message = messages[-1]

    return {"answer": last_message.content, "sources": []}


async def invoke_agent(query: str):
    print("QUERY:", query)
    result = await agent.ainvoke({"messages": [{"role": "user", "content": query}]})
    print("RESULT:", result)
    response = generate_response(question=query, messages=result["messages"])
    return response
