import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from pydantic import SecretStr

load_dotenv()


def get_llm_model(
    model: str = "inclusionai/ling-2.6-1t:free", temperature: float = 0.0
) -> ChatOpenAI:
    """Configures the LLM model from OpenRouter"""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY is not set in .env")

    return ChatOpenAI(
        model=model,
        temperature=temperature,
        api_key=SecretStr(api_key),
        base_url="https://openrouter.ai/api/v1",
    )
