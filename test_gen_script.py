import os
import asyncio
from dotenv import load_dotenv

load_dotenv("c:/Users/Adriane/Documents/teste-main/.env")

from google import genai

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

try:
    response = client.models.generate_content(
        model="gemini-3-flash-preview", 
        contents="Hello"
    )
    print("Success:", response.text)
except Exception as e:
    print("Exception:", e)
