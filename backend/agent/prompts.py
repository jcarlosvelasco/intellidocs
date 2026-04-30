from langchain_core.prompts import ChatPromptTemplate

# Grade Documents Node
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

# Rewrite node
rewrite_prompt = ChatPromptTemplate.from_template(
    """Look at the input and try to reason about the underlying semantic intent / meaning.

    Here is the initial question:
    \n ------- \n
    {question}
    \n ------- \n
    Formulate an improved question:"""
)

# System prompt
# system_prompt = ChatPromptTemplate.from_template(
#     """You are an assistant for question-answering tasks.
#     Use the following pieces of retrieved context to answer the question.
#     If you don't know the answer, just say that you don't know.
#     Use three sentences maximum and keep the answer concise.
#     Question: {question}
#     Context: {context}"""
# )


system_prompt = """You are an assistant for question-answering tasks.
Use tools when necessary to retrieve context.
If you don't know the answer, say that you don't know.
Use three sentences maximum and keep the answer concise."""
