import os
import sys

# Add root to sys.path to resolve backend imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.genai_service import generate_story_with_gemini

try:
    result = generate_story_with_gemini(
        nome="Hero",
        estilo="anime",
        universo="fantasy",
        genero="action",
        images=[],
        descricao="Teste"
    )
    print("Success:", result)
except Exception as e:
    import traceback
    traceback.print_exc()
