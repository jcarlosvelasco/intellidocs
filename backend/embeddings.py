import os

from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEndpointEmbeddings

load_dotenv()

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACEHUB_API_KEY")


def get_embeddings_model(model_name: str, task: str) -> HuggingFaceEndpointEmbeddings:
    return HuggingFaceEndpointEmbeddings(
        model=model_name, huggingfacehub_api_token=HUGGINGFACE_API_KEY, task=task
    )


hugging_face_key = os.getenv("HUGGINGFACEHUB_API_KEY")
if not hugging_face_key:
    raise ValueError("Hugging Face API key not found")

embeddings = HuggingFaceEndpointEmbeddings(
    model="BAAI/bge-small-en-v1.5",
    task="feature-extraction",
    huggingfacehub_api_token=hugging_face_key,
)
