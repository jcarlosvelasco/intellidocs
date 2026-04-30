from typing import cast

from langchain_core.tools import tool

from agent.llm.local_llm import get_local_llm
from agent.output.GradeDocuments import GradeDocuments
from agent.prompts import grade_documents_prompt


@tool
async def grade_documents_tool(question: str, context: str) -> str:
    """Evaluates if retrieved documents are relevant to a question."""

    print("Grade documents tool called!")

    model = get_local_llm(model="gemma4:e2b", temperature=0.2).with_structured_output(
        GradeDocuments
    )

    chain = grade_documents_prompt | model

    score = cast(
        GradeDocuments, await chain.ainvoke({"question": question, "context": context})
    )

    decision = "generate" if score.binary_score == "yes" else "rewrite"

    return decision
