import os
import asyncio
from dotenv import load_dotenv
from google import genai

load_dotenv(override=True)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def test_generation():
    models_to_test = ["gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    for model_name in models_to_test:
        print(f"Testing model: {model_name}")
        try:
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=["Hello, say 'Test successful'."]
            )
            print("Response received:", response.text)
        except Exception as e:
            print("Exception occurred:")
            print(type(e).__name__, ":", e)

asyncio.run(test_generation())
