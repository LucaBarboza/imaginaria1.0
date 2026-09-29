import os
from dotenv import load_dotenv
from google import genai
import asyncio

load_dotenv(override=True)

async def check_models():
    client = genai.Client()
    print("Available Gemini Models:")
    
    try:
        # Pydantic is already loaded implicitly most times, but the API may just need iterators 
        # Using synchronous approach as it's simpler to test available models 
        models = client.models.list()
        for m in models:
             print(f"- {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    asyncio.run(check_models())
