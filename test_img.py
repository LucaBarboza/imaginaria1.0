import os
import asyncio
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv(override=True)

async def test_image():
    client = genai.Client()
    try:
        response = await client.aio.models.generate_content(
            model="gemini-3.1-flash-image-preview",
            contents="A futuristic city with flying cars",
            config=types.GenerateContentConfig(
                response_modalities=['IMAGE'],
                image_config=types.ImageConfig(aspect_ratio="1:1", image_size="512px"),
            )
        )
        print("Response received")
        
        image_data = None
        if hasattr(response, 'candidates') and response.candidates:
            for candidate in response.candidates:
                if candidate.content and candidate.content.parts:
                    for part in candidate.content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data:
                            image_data = part.inline_data.data
                            print("Image data found!")
                            with open("test_img_test.png", "wb") as f:
                                f.write(image_data)
                            break
        
        if not image_data:
             print("No image data found in response.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_image())
