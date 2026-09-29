import asyncio
import aiohttp
import json
import os
import time
from datetime import datetime

# --- CONFIGURAÇÃO ---
BASE_URL = "http://localhost:8000"
UNIVERSES = [
    'fantasy_medieval', 'star_wars', 'harry_potter', 'marvel', 'dc',
    'disney_princess', 'simpsons', 'cyberpunk', 'lord_rings', 'pokemon',
    'pirates', 'western', 'noir', 'steampunk', 'naruto', 'dragon_ball',
    'one_piece', 'titan', 'saint_seiya', 'mario', 'zelda', 'minecraft',
    'arcane', 'sonic', 'football', 'volleyball', 'basketball', 'f1',
    'stranger_things', 'barbie', 'got', 'jurassic', 'spider_verse',
    'the_last_of_us', 'mickey', 'south_park', 'rick_morty', 'spongebob',
    'scooby', 'gravity_falls', 'steven_universe', 'phineas_ferb'
]

# Limites baseados na documentação e experiência
CONCURRENT_REQUESTS = 2 # Máximo de histórias simultâneas para não estourar tokens/segundo
MAX_RETRIES = 4
RETRY_DELAY = 5 # segundos base

# --- LOGGING ---
LOG_FILE = "full_test_log.txt"

def log_to_file(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {message}\n")
    print(message)

# --- CORE LOGIC ---

async def generate_and_save_story(session, universe_id, semaphore):
    async with semaphore:
        log_to_file(f"--- Iniciando teste CARTOON 2D (2 Imagens) para: {universe_id}")
        
        # 1. Dados para geração do TEXTO
        data = aiohttp.FormData()
        data.add_field('nome', 'Heroi de Teste')
        data.add_field('estilo', 'universe_default')
        data.add_field('universo', universe_id)
        data.add_field('genero', 'epic')
        data.add_field('descricao', f'Uma aventura epica testando a consistencia visual cartoon 2D do universo {universe_id}.')

        attempt = 1
        while attempt <= MAX_RETRIES:
            try:
                # ETAPA 1: Gerar História (Texto e Prompts)
                log_to_file(f"DEBUG: Gerando texto para {universe_id} (Tentativa {attempt})...")
                async with session.post(f"{BASE_URL}/api/generate-story", data=data) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise Exception(f"Erro na API de Texto (Status {response.status}): {error_text}")
                    
                    result_json = await response.json()
                    story_data = result_json.get("data", {}).get("story")
                    if not story_data:
                        raise Exception("Resposta da API nao contem dados da historia.")

                log_to_file(f"SUCCESS: Texto gerado para {universe_id}")

                # ETAPA 2: Gerar 2 IMAGENS (Capa + Cena 1) em lote com Estilo Cartoon
                log_to_file(f"INFO: Gerando 2 cenas (capa + cena 1) cartoon para {universe_id}...")
                
                pages = story_data.get("pages", [])
                first_page_prompt = pages[0].get("illustration_prompt", "") if pages else "A hero in the world of " + universe_id
                
                # Forçar estilo Cartoon 2D
                style_suffix = " in a consistent cartoon 2D style, vibrant colors, flat shading."
                prompts = [
                    story_data.get("visual_identity", {}).get("clothing_bible", "") + ". Cover art: " + first_page_prompt + style_suffix,
                    story_data.get("visual_identity", {}).get("clothing_bible", "") + ". Scene 1: " + first_page_prompt + style_suffix
                ]

                # Payload para lote
                img_data = aiohttp.FormData()
                img_data.add_field('prompts_json', json.dumps(prompts))
                img_data.add_field('person_name', 'Heroi de Teste')
                img_data.add_field('universe_context', universe_id)

                async with session.post(f"{BASE_URL}/api/generate-images-batch", data=img_data) as img_response:
                    if img_response.status != 200:
                        img_error = await img_response.text()
                        log_to_file(f"WARNING: Falha ao gerar imagens batch para {universe_id}: {img_error}")
                        image_urls = ["https://placehold.co/1024x1024/202020/666666/png?text=Erro+Imagem"] * 2
                    else:
                        img_result = await img_response.json()
                        image_urls = img_result.get("image_urls", ["https://placehold.co/1024x1024/202020/666666/png?text=Capa", "https://placehold.co/1024x1024/202020/666666/png?text=Cena1"])
                        log_to_file(f"INFO: 2 imagens cartoon geradas para {universe_id}")

                # ETAPA 3: Salvar História (Capa Real + Cena 1 Real + Placeholders)
                log_to_file(f"INFO: Salvando historia final de {universe_id}...")
                
                cover_url = image_urls[0] if len(image_urls) > 0 else "https://placehold.co/1024x1024/202020/666666/png?text=Capa"
                chapters = []
                for i, page in enumerate(pages):
                    img_url = "https://placehold.co/1024x1024/202020/666666/png?text=Pagina+Economic+Mode"
                    if i == 0 and len(image_urls) > 1:
                        img_url = image_urls[1] # A primeira página ganha a imagem real
                        
                    chapters.append({
                        "text": page.get("text", ""),
                        "image_url": img_url
                    })

                save_payload = {
                    "title": story_data.get("title", f"Teste {universe_id}"),
                    "cover_image_url": cover_url,
                    "chapters": chapters,
                    "metadata": {
                        "test_run": True,
                        "style": "cartoon_2d",
                        "universe": universe_id,
                        "timestamp": datetime.now().isoformat()
                    },
                    "logs": [f"Gerada via script de teste CARTOON 2D (2 imagens) para o universo {universe_id}"]
                }

                async with session.post(f"{BASE_URL}/api/save-story", json=save_payload) as save_response:
                    if save_response.status != 200:
                        save_error = await save_response.text()
                        log_to_file(f"WARNING: Erro ao salvar historia de {universe_id}: {save_error}")
                    else:
                        save_result = await save_response.json()
                        log_to_file(f"DONE: Historia de {universe_id} salva com ID: {save_result.get('story_id')}")

                return True 

            except Exception as e:
                log_to_file(f"ERROR: Falha em {universe_id} (Tentativa {attempt}/{MAX_RETRIES}): {str(e)}")
                if attempt < MAX_RETRIES:
                    wait = RETRY_DELAY * attempt
                    log_to_file(f"WAIT: Aguardando {wait}s para re-tentar...")
                    await asyncio.sleep(wait)
                attempt += 1

        log_to_file(f"FAIL: Abortando universo {universe_id} apos {MAX_RETRIES} tentativas.")
        return False

async def main():
    # Limpar log anterior
    if os.path.exists(LOG_FILE):
        os.remove(LOG_FILE)
    
    log_to_file("====================================================")
    log_to_file("INICIANDO TESTE GLOBAL DE UNIVERSOS")
    log_to_file(f"Total de universos: {len(UNIVERSES)}")
    log_to_file("====================================================")

    semaphore = asyncio.Semaphore(CONCURRENT_REQUESTS)
    
    async with aiohttp.ClientSession() as session:
        tasks = [generate_and_save_story(session, u_id, semaphore) for u_id in UNIVERSES]
        results = await asyncio.gather(*tasks)

    success_count = sum(1 for r in results if r)
    fail_count = len(UNIVERSES) - success_count

    log_to_file("====================================================")
    log_to_file("RESUMO FINAL DO TESTE")
    log_to_file(f"✅ Sucessos: {success_count}")
    log_to_file(f"❌ Falhas: {fail_count}")
    log_to_file("====================================================")
    
    if fail_count > 0:
        log_to_file("Verifique as falhas acima para ajustar os prompts ou o modelo.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nTeste interrompido pelo usuário.")
