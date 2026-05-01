import json
from typing import cast

from langchain_core.messages import ToolMessage

from agent.llm.llm import get_llm_model
from agent.output.GradeDocuments import GradeDocuments
from agent.prompts import grade_documents_prompt
from agent.state import State


async def grade_documents(state: State) -> dict:
    """Evaluates if the retrieved documents are relevant."""
    print("Grading documents...")
    question = state["question"]

    # Extraer documentos del último ToolMessage
    last_tool_message = next(
        m for m in reversed(state["messages"]) if isinstance(m, ToolMessage)
    )

    # Parse content if it's JSON
    content = last_tool_message.content
    if isinstance(content, str):
        try:
            docs = json.loads(content)
        except (json.JSONDecodeError, TypeError):
            docs = content
    else:
        docs = content

    # Format documents for the grading prompt
    if isinstance(docs, list):
        # Format each document
        formatted_docs = []
        for doc in docs:
            if isinstance(doc, dict):
                page_content = doc.get("pageContent", "")
                metadata = doc.get("metadata", {})
                source = metadata.get("source", "Unknown")
                page = metadata.get("page", "N/A")
                formatted_docs.append(
                    f"[Source: {source}, Page: {page}]\n{page_content}"
                )
            else:
                formatted_docs.append(str(doc))
        context = "\n\n---\n\n".join(formatted_docs)
    else:
        context = str(docs)

    print(f"Context for grading: {context[:200]}...")

    model = get_llm_model(temperature=0.2).with_structured_output(GradeDocuments)
    chain = grade_documents_prompt | model
    score = cast(
        GradeDocuments, await chain.ainvoke({"question": question, "context": context})
    )

    return {"documents": [context], "grade": score.binary_score}
