
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
from pydantic import BaseModel
import uvicorn
import traceback

# Import the service
try:
    from backend.genai_service import generate_story_with_gemini, generate_image_with_gemini
except ImportError:
    from genai_service import generate_story_with_gemini, generate_image_with_gemini
import shutil
import uuid
import os
import base64
import json
import io
import re
from pathlib import Path
import requests
from PIL import Image

app = FastAPI()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"GLOBAL EXCEPTION CAUGHT: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"Uncaught Server Error: {str(exc)}"}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure temp directory for images exists
IMG_DIR = "generated_images_temp"
if not os.path.exists(IMG_DIR):
    os.makedirs(IMG_DIR)

# Ensure saved stories directory exists
STORIES_DIR = "story_generated"
if not os.path.exists(STORIES_DIR):
    os.makedirs(STORIES_DIR)

# Mount the static directory to serve images
from fastapi.staticfiles import StaticFiles
app.mount("/images", StaticFiles(directory=IMG_DIR), name="images")
app.mount("/stories", StaticFiles(directory=STORIES_DIR), name="stories")

class InputResponse(BaseModel):
    status: str
    mensagem: str
    dados: dict

# Existing endpoint kept for reference or legacy
@app.post("/teste-inputs", response_model=InputResponse)
async def teste_inputs(
    nome: str = Form(..., description="Nome do usuário"),
    estilo: str = Form(..., description="Estilo de ilustração"),
    universo: str = Form(..., description="Universo escolhido"),
    genero: str = Form(..., description="Gênero da história"),
    imagens: List[UploadFile] = File(..., description="Imagens de referência")
):
    """
    Endpoint para testar o recebimento dos inputs do usuário.
    """
    
    # Processar informações das imagens (sem salvar por enquanto)
    detalhes_imagens = []
    for img in imagens:
        detalhes_imagens.append({
            "filename": img.filename,
            "content_type": img.content_type
        })
    
    return {
        "status": "sucesso",
        "mensagem": "Inputs recebidos e validados com sucesso!",
        "dados": {
            "nome": nome,
            "estilo": estilo,
            "universo": universo,
            "genero": genero,
            "imagens_recebidas": len(imagens),
            "detalhes_imagens": detalhes_imagens
        }
    }

from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse

@app.post("/api/generate-story")
async def generate_story_endpoint(
    nome: str = Form(...),
    estilo: str = Form(...),
    universo: str = Form(...),
    genero: str = Form(...),
    descricao: str = Form(None),
    image_urls_json: Optional[str] = Form(None),
    character_details_json: Optional[str] = Form(None),
    imagens: List[UploadFile] = File(default=[])
):
    print(f"DEBUG: generate_story_endpoint. Name={nome}, Urls={bool(image_urls_json)}, Files={len(imagens) if imagens else 0}")
    try:
        processed_images = []

        # 1. Download images from URLs (Backend Fetching to avoid CORS)
        if image_urls_json:
            try:
                urls_data = json.loads(image_urls_json) # List of {"url": ..., "name": ...}
                for item in urls_data:
                    url = item.get("url")
                    if url:
                        try:
                            print(f"Downloading story ref image: {url}")
                            # Run synchronous requests in threadpool to avoid blocking event loop
                            resp = await run_in_threadpool(lambda u=url: requests.get(u, timeout=10))
                            if resp.status_code == 200:
                                processed_images.append({
                                    "data": resp.content,
                                    "mime_type": resp.headers.get("Content-Type", "image/jpeg")
                                })
                            else:
                                print(f"Failed to download {url}: {resp.status_code}")
                        except Exception as e:
                            print(f"Error downloading {url}: {e}")
            except json.JSONDecodeError:
                print("Error decoding image_urls_json")

        # Process character details
        character_details = None
        if character_details_json:
            try:
                character_details = json.loads(character_details_json)
            except json.JSONDecodeError:
                print("Error decoding character_details_json")

        # 2. Process uploaded files (if any)
        if imagens:
            for img in imagens:
                content = await img.read()
                processed_images.append({
                    "data": content,
                    "mime_type": img.content_type
                })

        if not processed_images:
            # It's possible to generate without images, but usually we want them
            print("Warning: No images provided for story generation")

        # Generate story (fully async now)
        story_data = await generate_story_with_gemini(
            nome=nome,
            estilo=estilo,
            universo=universo,
            genero=genero,
            images=processed_images,
            descricao=descricao,
            character_details=character_details
        )
        
        return {
            "status": "success",
            "data": story_data
        }

    except Exception as e:
        print(f"CRITICAL ERROR in generate_story_endpoint: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": f"Internal Server Error: {str(e)}"})

@app.post("/api/generate-image")
async def generate_image_endpoint(
    prompt: str = Form(...),
    person_name: str = Form(...),
    universe_context: str = Form(...),
    reference_image_urls_json: Optional[str] = Form(None),
    reference_images: Optional[List[UploadFile]] = File(None),
    style_reference_url: Optional[str] = Form(None),
):
    print(f"DEBUG: generate_image_endpoint. Prompt={prompt[:20]}, Urls={bool(reference_image_urls_json)}, Files={len(reference_images) if reference_images else 0}")
    try:
        processed_images = []
        
        # Determine if reference_images is None (because of default=None)
        if reference_images is None:
            reference_images = []
        
        # Determine if reference_images is None (because of default=None)
        if reference_images is None:
            reference_images = []

        # 1. Download images from URLs
        if reference_image_urls_json:
            try:
                urls_data = json.loads(reference_image_urls_json) # List of {"url": ..., "name": ...}
                for item in urls_data:
                    url = item.get("url")
                    name = item.get("name", "reference")
                    if url:
                        try:
                            # print(f"Downloading image ref: {url}")
                            resp = requests.get(url, timeout=10)
                            if resp.status_code == 200:
                                processed_images.append({
                                    "data": resp.content,
                                    "mime_type": resp.headers.get("Content-Type", "image/jpeg"),
                                    "filename": f"character_{name}_ref.jpg" # Fake filename to trigger identity lock logic
                                })
                            else:
                                print(f"Failed to download image ref {url}: {resp.status_code}")
                        except Exception as e:
                            print(f"Error downloading image ref {url}: {e}")
            except Exception as e:
                 print(f"Error processing reference_image_urls_json: {e}")

        # 2. Process uploaded files
        if reference_images:
            for img in reference_images:
                content = await img.read()
                processed_images.append({
                    "data": content,
                    "mime_type": img.content_type,
                    "filename": img.filename
                })

        # 2.5 Process style_reference_url directly from disk if possible
        if style_reference_url:
            try:
                # Expects style_reference_url to be like /images/xxxx.webp
                filename = style_reference_url.strip("/").split("/")[-1]
                filepath = os.path.join(IMG_DIR, filename)
                if os.path.exists(filepath):
                    print(f"DEBUG: Found local style reference image: {filepath}")
                    with open(filepath, "rb") as f:
                        processed_images.append({
                            "data": f.read(),
                            "mime_type": "image/webp" if filename.endswith(".webp") else "image/png",
                            "filename": "style_ref_0.png"
                        })
                else:
                    print(f"WARNING: Local style reference image not found: {filepath}")
            except Exception as e:
                print(f"Error reading style_reference_url from disk: {e}")

        # Generate image
        result = await generate_image_with_gemini(
            prompt=prompt,
            reference_images=processed_images,
            person_name=person_name,
            universe_context=universe_context
        )
        
        image_bytes = result["image_data"]
        
        # Save to file
        filename = f"{uuid.uuid4()}.webp"
        filepath = os.path.join(IMG_DIR, filename)
        
        try:
            # Optimize and convert to WebP
            image = Image.open(io.BytesIO(image_bytes))
            # Convert to RGB if it has alpha channel
            if image.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[-1])
                image = background
            image.save(filepath, "webp", quality=85)
        except Exception as e:
            print(f"Error converting to webp, saving original bytes: {e}")
            filename = f"{uuid.uuid4()}.png"
            filepath = os.path.join(IMG_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(image_bytes)
            
        # Construct URL (assuming local dev)
        # In production this should be a proper URL
        image_url = f"/images/{filename}"
        
        return {
            "status": "success",
            "image_url": image_url,
            "filepath": filepath,
            "generation_log": {
                "effective_prompt": result.get("effective_prompt", ""),
                "usage": result.get("usage_metadata", {})
            }
        }

    except Exception as e:
        print(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

import asyncio

@app.post("/api/generate-images-batch")
async def generate_images_batch_endpoint(
    prompts_json: str = Form(..., description="A JSON string representing a list of strings (prompts)."),
    person_name: str = Form(...),
    universe_context: str = Form(...),
    reference_image_urls_json: Optional[str] = Form(None),
    reference_images: Optional[List[UploadFile]] = File(None),
    style_reference_url: Optional[str] = Form(None),
):
    try:
        prompts = json.loads(prompts_json)
        if not isinstance(prompts, list):
            raise ValueError("prompts_json must be a JSON array of strings.")
            
        print(f"DEBUG: generate_images_batch_endpoint. Batch Size={len(prompts)}, Person={person_name}")
        
        processed_images = []
        if reference_images is None:
            reference_images = []

        # 1. Download images from URLs ONCE for the whole batch
        if reference_image_urls_json:
            try:
                urls_data = json.loads(reference_image_urls_json)
                for item in urls_data:
                    url = item.get("url")
                    name = item.get("name", "reference")
                    if url:
                        try:
                            resp = await run_in_threadpool(lambda u=url: requests.get(u, timeout=10))
                            if resp.status_code == 200:
                                processed_images.append({
                                    "data": resp.content,
                                    "mime_type": resp.headers.get("Content-Type", "image/jpeg"),
                                    "filename": f"character_{name}_ref.jpg"
                                })
                        except Exception as e:
                            print(f"Error downloading image ref {url}: {e}")
            except Exception as e:
                 print(f"Error processing reference_image_urls_json: {e}")

        # 2. Process uploaded files ONCE for the whole batch
        if reference_images:
            for img in reference_images:
                content = await img.read()
                processed_images.append({
                    "data": content,
                    "mime_type": img.content_type,
                    "filename": img.filename
                })

        # 2.5 Process style_reference_url directly from disk if possible
        if style_reference_url:
            try:
                # Expects style_reference_url to be like /images/xxxx.webp
                filename = style_reference_url.strip("/").split("/")[-1]
                filepath = os.path.join(IMG_DIR, filename)
                if os.path.exists(filepath):
                    print(f"DEBUG: Found local style reference image: {filepath}")
                    with open(filepath, "rb") as f:
                        processed_images.append({
                            "data": f.read(),
                            "mime_type": "image/webp" if filename.endswith(".webp") else "image/png",
                            "filename": "style_ref_0.png"
                        })
                else:
                    print(f"WARNING: Local style reference image not found: {filepath}")
            except Exception as e:
                print(f"Error reading style_reference_url from disk: {e}")

        # Helper function to generate and save a single image
        async def process_single_image(prompt: str, idx: int):
            print(f"DEBUG: Processing image {idx + 1}/{len(prompts)} for prompt snippet: {prompt[:20]}...")
            try:
                result = await generate_image_with_gemini(
                    prompt=prompt,
                    reference_images=processed_images, # Reusing the processed refs
                    person_name=person_name,
                    universe_context=universe_context
                )
                
                image_bytes = result["image_data"]
                filename = f"{uuid.uuid4()}.webp"
                filepath = os.path.join(IMG_DIR, filename)
                
                try:
                    # Optimize and convert to WebP
                    image = Image.open(io.BytesIO(image_bytes))
                    if image.mode in ('RGBA', 'LA'):
                        background = Image.new('RGB', image.size, (255, 255, 255))
                        background.paste(image, mask=image.split()[-1])
                        image = background
                    # Need to run CPU bound image saving in threadpool to not block asyncio tasks
                    await run_in_threadpool(lambda: image.save(filepath, "webp", quality=85))
                except Exception as e:
                    print(f"Task {idx}: Error converting to webp: {e}")
                    filename = f"{uuid.uuid4()}.png"
                    filepath = os.path.join(IMG_DIR, filename)
                    await run_in_threadpool(lambda p=filepath, b=image_bytes: open(p, "wb").write(b))
                    
                image_url = f"/images/{filename}"
                
                return {
                    "success": True,
                    "index": idx,
                    "prompt": prompt,
                    "image_url": image_url,
                    "filepath": filepath,
                    "generation_log": {
                        "effective_prompt": result.get("effective_prompt", ""),
                        "usage": result.get("usage_metadata", {})
                    }
                }
            except Exception as e:
                print(f"Task {idx}: Error generating image: {e}")
                return {
                    "success": False,
                    "index": idx,
                    "prompt": prompt,
                    "error": str(e)
                }

        # 3. Fire all generation tasks concurrently using asyncio.gather
        tasks = [process_single_image(prompt, idx) for idx, prompt in enumerate(prompts)]
        results = await asyncio.gather(*tasks)

        # 4. Sort results back to original prompt order (gather usually preserves order, but being explicit is safe)
        results = sorted(results, key=lambda x: x["index"])

        return {
            "status": "success",
            "results": results
        }

    except Exception as e:
        print(f"Error in batch image generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def sanitize_filename(name):
    return re.sub(r'[<>:"/\\|?*]', '', name).strip()

class SaveStoryRequest(BaseModel):
    title: str
    cover_image_url: str
    chapters: List[dict] # {text: str, image_url: str}
    metadata: dict = {}
    logs: List[str] = []

@app.post("/api/save-story")
async def save_story_endpoint(story: SaveStoryRequest):
    try:
        # Create a safe folder name
        safe_title = sanitize_filename(story.title)
        # Add a UUID suffix to avoid collisions if titles are same
        unique_id = str(uuid.uuid4())[:8]
        folder_name = f"{safe_title}_{unique_id}"
        story_path = os.path.join(STORIES_DIR, folder_name)
        
        # Create subdirectories
        images_dir = os.path.join(story_path, "images")
        logs_dir = os.path.join(story_path, "logs")
        
        os.makedirs(story_path, exist_ok=True)
        os.makedirs(images_dir, exist_ok=True)
        os.makedirs(logs_dir, exist_ok=True)

        # 1. Download/Copy images
        # Helper to handle image moving
        def process_image(url, prefix):
            if not url: return None
            # Extract filename from URL (assuming /images/filename.png)
            if "/images/" in url:
                original_filename = url.split("/images/")[-1]
                source_path = os.path.join(IMG_DIR, original_filename)
                # Maintain the extension if possible, otherwise webp
                ext = original_filename.split('.')[-1] if '.' in original_filename else 'webp'
                new_filename = f"{prefix}_{original_filename.split('.')[0]}.{ext}"
                dest_path = os.path.join(images_dir, new_filename)
                
                if os.path.exists(source_path):
                    shutil.copy2(source_path, dest_path)
                    # Return relative path for frontend/HTML use
                    return f"images/{new_filename}"
                else:
                    print(f"Warning: Image source not found: {source_path}")
                    return url
            return url

        # Process Cover
        saved_cover = process_image(story.cover_image_url, "cover")
        
        # Process Chapters
        saved_chapters = []
        for idx, chap in enumerate(story.chapters):
            saved_img = process_image(chap['image_url'], f"chap_{idx+1}")
            saved_chapters.append({
                "text": chap['text'],
                "image": saved_img
            })

        # 2. Save story.json
        final_story_data = {
            "title": story.title,
            "cover_image": saved_cover,
            "chapters": saved_chapters,
            "id": folder_name
        }
        
        with open(os.path.join(story_path, "story.json"), "w", encoding="utf-8") as f:
            json.dump(final_story_data, f, ensure_ascii=False, indent=2)

        # 3. Save Logs and Metadata
        # Save Metadata (Inputs, Timestamps, etc)
        with open(os.path.join(logs_dir, "metadata.json"), "w", encoding="utf-8") as f:
            json.dump(story.metadata, f, ensure_ascii=False, indent=2)
            
        # Save User Logs
        with open(os.path.join(logs_dir, "execution_logs.txt"), "w", encoding="utf-8") as f:
            f.write("\n".join(story.logs))

        # Save Raw Prompt (if available)
        if "llm_details" in story.metadata and "prompt_used" in story.metadata["llm_details"]:
            with open(os.path.join(logs_dir, "prompt_sent.txt"), "w", encoding="utf-8") as f:
                f.write(story.metadata["llm_details"]["prompt_used"])

        # 4. Generate story.md (Text Version)
        md_content = f"# {final_story_data['title']}\n\n"
        if final_story_data.get('cover_image'):
             md_content += f"![Cover]({final_story_data['cover_image']})\n\n"
        for idx, chap in enumerate(final_story_data['chapters']):
            md_content += f"## Capítulo {idx+1}\n\n"
            md_content += f"{chap['text']}\n\n"
            if chap.get('image'):
                md_content += f"![Scene {idx+1}]({chap['image']})\n\n"
            else:
                md_content += "\n"
            
        with open(os.path.join(story_path, "story.md"), "w", encoding="utf-8") as f:
            f.write(md_content)

        # 5. Generate index.html (Standalone Site)
        template_path = os.path.join("backend", "template_site.html")
        if os.path.exists(template_path):
            with open(template_path, "r", encoding="utf-8") as t:
                html_content = t.read()
            
            # Inject data
            json_str = json.dumps(final_story_data, ensure_ascii=False)
            injection_code = f"window.embeddedStory = {json_str};"
            html_content = html_content.replace("// __STORY_DATA_INJECTION__", injection_code)
            
            with open(os.path.join(story_path, "index.html"), "w", encoding="utf-8") as f:
                f.write(html_content)

        return {
            "status": "success",
            "message": "História salva com sucesso!",
            "story_id": folder_name,
            "path": os.path.abspath(story_path)
        }

    except Exception as e:
        print(f"Error saving story: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stories")
async def get_stories():
    try:
        stories = []
        if os.path.exists(STORIES_DIR):
            for folder in os.listdir(STORIES_DIR):
                folder_path = os.path.join(STORIES_DIR, folder)
                json_path = os.path.join(folder_path, "story.json")
                
                if os.path.isdir(folder_path) and os.path.exists(json_path):
                    try:
                        with open(json_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            # Fix image URLs for serving
                            data["cover_image"] = f"/stories/{folder}/{data['cover_image']}"
                            # We don't need all chapters for the list, just metadata
                            stories.append({
                                "id": folder,
                                "title": data["title"],
                                "cover": data["cover_image"]
                            })
                    except Exception:
                        continue
        return stories
    except Exception as e:
        print(f"Error listing stories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stories/{story_id}")
async def get_story_details(story_id: str):
    try:
        folder_path = os.path.join(STORIES_DIR, story_id)
        json_path = os.path.join(folder_path, "story.json")
        
        if not os.path.exists(json_path):
            raise HTTPException(status_code=404, detail="Story not found")
            
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # Fix image URLs to be absolute server paths for the frontend
        data["cover_image"] = f"/stories/{story_id}/{data['cover_image']}"
        for chap in data["chapters"]:
            chap["image"] = f"/stories/{story_id}/{chap['image']}"
            
        return data
    except Exception as e:
        print(f"Error loading story: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/stories/{story_id}")
async def delete_story(story_id: str):
    try:
        folder_path = os.path.join(STORIES_DIR, story_id)
        
        if not os.path.exists(folder_path):
            raise HTTPException(status_code=404, detail="Story not found")
            
        shutil.rmtree(folder_path)
        return {"status": "success", "message": "Story deleted successfully"}
    except Exception as e:
        print(f"Error deleting story: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
