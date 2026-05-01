from langchain_core.messages import AIMessage

from agent.llm.llm import get_llm_model
from agent.output import GradeDocuments
from agent.prompts import grade_documents_prompt
from agent.state import State


async def grade_documents(state: State):
    """Evaluates if the retrieved documents are relevant"""
    print("Agent, In gradeDocuments node")
    messages = state["messages"]

    model = get_llm_model().with_structured_output(GradeDocuments)

    question = messages[0].content
    context = messages[-1].content

    score = await (grade_documents_prompt | model).ainvoke(
        {"question": question, "context": context}
    )

    decision_message = AIMessage(
        content="generate" if score.binary_score == "yes" else "rewrite",
        name="grader_decision",
    )

    return {"messages": [decision_message]}
