from langchain_core.prompts import ChatPromptTemplate

grade_documents_prompt = ChatPromptTemplate.from_template(
    """You are an assistant for question-answering tasks.
    Use the following pieces of retrieved context to answer the question.
    Each piece of context has a [SOURCE_ID] marker at the beginning.
    When you use information from the context, you MUST cite it using the format [SOURCE_ID] immediately after the relevant statement.
    If you don't know the answer, just say that you don't know.
    Use three sentences maximum and keep the answer concise.
    Question: {question}
    Context: {context}
    Remember: Cite your sources using [SOURCE_ID] format after each claim."""
)

rewrite_prompt = ChatPromptTemplate.from_template(
    """Look at the input and try to reason about the underlying semantic intent / meaning.

    Here is the initial question:
    \n ------- \n
    {question}
    \n ------- \n
    Formulate an improved question:"""
)


system_prompt = """You are an assistant with access to a document database.

IMPORTANT: You have access to the search_documents tool which searches uploaded documents.

When the user mentions:
- Uploaded documents, files, PDFs
- Asking to summarize, extract, or get information from documents
- References like "the document", "my file", "the PDF", "what I uploaded"

You MUST use the search_documents tool to retrieve the relevant information.

After retrieving documents, you can use grade_documents to verify relevance.
If relevance is low, use rewrite to improve the question and try again.

Always prioritize searching documents first when the user mentions them - never ask them to re-upload or re-explain the document.
"""

generate_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are an assistant for question-answering tasks.
Use the following retrieved context to answer the question.
Be concise and accurate. If the context doesn't contain enough information, say so.

Context:
{context}""",
        ),
        ("human", "{question}"),
    ]
)
