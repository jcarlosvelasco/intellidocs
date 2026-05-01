from typing import cast

from langchain_core.messages import ToolMessage

from agent.llm.local_llm import get_local_llm
from agent.output.GradeDocuments import GradeDocuments
from agent.prompts import grade_documents_prompt
from agent.state import State


async def grade_documents(state: State) -> dict:
    """Evalúa si los documentos recuperados son relevantes."""
    print("Grading documents...")
    question = state["question"]

    # Extraer documentos del último ToolMessage
    last_tool_message = next(
        m for m in reversed(state["messages"]) if isinstance(m, ToolMessage)
    )
    context = last_tool_message.content

    model = get_local_llm(model="gemma4:e2b", temperature=0.2).with_structured_output(
        GradeDocuments
    )
    chain = grade_documents_prompt | model
    score = cast(
        GradeDocuments, await chain.ainvoke({"question": question, "context": context})
    )

    return {"documents": [context], "grade": score.binary_score}
