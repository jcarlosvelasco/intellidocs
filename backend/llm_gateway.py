import asyncio
import logging
import os
import time

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from pydantic import SecretStr

load_dotenv()
logger = logging.getLogger(__name__)

# Models in priority order (cascade fallback)
OPENROUTER_MODELS = [
    "arcee-ai/trinity-large-preview:free",  # primary
    "google/gemma-4-31b-it:free",  # fallback 1
    "google/gemma-4-26b-a4b-it:free",  # fallback 2
    "minimax/minimax-m2.5:free",  # fallback 3
]

RETRY_CONFIG = {
    "max_retries": 3,
    "base_delay": 2.0,  # seconds
    "backoff_factor": 2,  # delay * 2^attempt
    "max_delay": 30.0,
}

# Errors that justify retrying (transient)
RETRYABLE_ERRORS = (
    "rate limit",
    "rate-limited",
    "429",
    "timeout",
    "connection",
    "server error",
    "503",
    "502",
    "529",
)

# Errors that justify switching to the next model
FALLBACK_ERRORS = (
    "model not found",
    "model unavailable",
    "no endpoints",
    "404",
    "is not a valid model",
    "invalid model",
)


def _is_retryable(error: Exception) -> bool:
    msg = str(error).lower()
    return any(k in msg for k in RETRYABLE_ERRORS)


def _is_fallback(error: Exception) -> bool:
    msg = str(error).lower()
    return any(k in msg for k in FALLBACK_ERRORS)


def _build_client(model: str) -> ChatOpenAI:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY is not set in .env")
    return ChatOpenAI(
        model=model,
        temperature=0.1,
        api_key=SecretStr(api_key),
        base_url="https://openrouter.ai/api/v1",
    )


def get_llm_model(model_override: str | None = None) -> ChatOpenAI:
    """
    Returns a ChatOpenAI instance for the first available model.
    If model_override is provided, it is tried first before the default list.
    """
    candidates = (
        [model_override] + OPENROUTER_MODELS if model_override else OPENROUTER_MODELS
    )

    last_error = None

    for model in candidates:
        retries = 0
        while retries <= RETRY_CONFIG["max_retries"]:
            try:
                client = _build_client(model)
                # Lightweight probe to verify the model responds
                client.invoke("ping")
                logger.info(f"✅ Active model: {model}")
                return client

            except Exception as e:
                last_error = e

                if _is_fallback(e):
                    logger.warning(
                        f"⏭️  Model unavailable [{model}]: {e}. Skipping to the next."
                    )
                    break  # exit while, try next model

                if _is_retryable(e) and retries < RETRY_CONFIG["max_retries"]:
                    delay = min(
                        RETRY_CONFIG["base_delay"]
                        * (RETRY_CONFIG["backoff_factor"] ** retries),
                        RETRY_CONFIG["max_delay"],
                    )
                    logger.warning(
                        f"🔄 Retry {retries + 1}/{RETRY_CONFIG['max_retries']} "
                        f"for [{model}] in {delay:.1f}s — {e}"
                    )
                    time.sleep(delay)
                    retries += 1
                else:
                    # Non-retryable or exhausted retries: log and try next model
                    logger.error(f"❌ Non-recoverable error in [{model}]: {e}")
                    break  # unknown error, try next model

    raise RuntimeError(
        f"🚨 No available model after exhausting the fallback list.\n"
        f"Last error: {last_error}"
    )


async def run_chain_with_fallback(
    payload,
    model_override: str | None = None,
    tools: list | None = None,
):
    """
    Run a chain/messages/payload against the configured OPENROUTER_MODELS with
    retries, exponential backoff and automatic fallback.

    - `payload`: the messages or prompt payload to pass to the model's async invoke.
      This mirrors how callers use `model.ainvoke(...)`. It may also be a tuple
      `(chain, inputs)` where `chain` is a prompt/chain object and `inputs` is
      the input dict meant for that chain's `ainvoke`.
    - `tools`: optional list of tools to bind to the client (if the client supports `.bind_tools()`).
    - `model_override`: optional model string to try first.

    Behavior:
    - Tries candidates in order (override first if provided).
    - For retryable errors will retry with exponential backoff.
    - For fallback errors (model not found / no endpoints / 404) will skip to the next model.
    - Returns the model/chain response on success, raises RuntimeError if all candidates fail.
    """
    candidates = (
        [model_override] + OPENROUTER_MODELS if model_override else OPENROUTER_MODELS
    )

    last_error = None

    for model in candidates:
        retries = 0
        while retries <= RETRY_CONFIG["max_retries"]:
            try:
                client = _build_client(model)

                # Try to bind tools if provided and supported by the client wrapper
                if tools:
                    try:
                        client = client.bind_tools(tools)
                    except Exception:
                        # Not all client wrappers support bind_tools; ignore binding failures
                        logger.debug(
                            f"Client {model} does not support bind_tools or binding failed."
                        )

                logger.info(f"Attempting async invoke with model: {model}")

                # Support two payload styles:
                # 1) Direct messages / inputs: call client.ainvoke(payload)
                # 2) Tuple (chain, inputs): call chain.ainvoke(inputs) (chain is expected to know how to handle the bound client)
                if isinstance(payload, tuple) and len(payload) == 2:
                    chain, inputs = payload
                    # Prefer calling the chain directly (chain may be prompt | client pattern)
                    try:
                        response = await chain.ainvoke(inputs)
                    except Exception:
                        # Fall back to invoking the client directly with the inputs if chain invocation fails
                        response = await client.ainvoke(inputs)
                else:
                    response = await client.ainvoke(payload)

                logger.info(f"✅ Successful async invoke with model: {model}")
                return response

            except Exception as e:
                last_error = e

                if _is_fallback(e):
                    logger.warning(
                        f"⏭️  Model unavailable [{model}]: {e}. Skipping to the next."
                    )
                    break  # try next model

                if _is_retryable(e) and retries < RETRY_CONFIG["max_retries"]:
                    delay = min(
                        RETRY_CONFIG["base_delay"]
                        * (RETRY_CONFIG["backoff_factor"] ** retries),
                        RETRY_CONFIG["max_delay"],
                    )
                    logger.warning(
                        f"🔄 Async retry {retries + 1}/{RETRY_CONFIG['max_retries']} "
                        f"for [{model}] in {delay:.1f}s — {e}"
                    )
                    await asyncio.sleep(delay)
                    retries += 1
                else:
                    logger.error(f"❌ Non-recoverable async error in [{model}]: {e}")
                    break  # try next model

    raise RuntimeError(
        "🚨 No available model could complete the async invocation after trying "
        f"candidates. Last error: {last_error}"
    )
