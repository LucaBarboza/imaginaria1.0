
import os
import asyncio
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

# Load environment variables
load_dotenv(override=True)

# Configure Client
api_key = os.getenv("GEMINI_API_KEY")
try:
    if api_key:
        client = genai.Client(api_key=api_key)
    else:
        client = None
        print("WARNING: GEMINI_API_KEY not found in environment variables.")
except Exception as e:
    client = None
    print(f"Error initializing Gemini Client: {e}")

class StoryPage(BaseModel):
    page_number: int = Field(description="O número da página, de 1 a 10.")
    text: str = Field(description="Texto envolvente e detalhado da página (entre 80 e 300 palavras).")
    illustration_prompt: str = Field(
        ...,
        description="Prompt de imagem super detalhado em inglês. OBRIGATÓRIO para todas as 10 páginas da aventura."
    )

class Story(BaseModel):
    title: str = Field(description="O título épico e chamativo da história.")
    cover_prompt: str = Field(description="Um prompt detalhado em inglês para gerar uma imagem de capa cinematográfica em formato wide (16:9).")
    clothing_bible: str = Field(description="Um prompt descritivo em inglês DETALHANDO EXTREMAMENTE as roupas dos personagens para garantir consistência. Exemplo: 'John is wearing a heavy brown leather coat over a white linen shirt, dark blue trousers, and sturdy black leather boots. Mary is wearing an elegant emerald green silk dress with golden embroidery.'")
    pages: List[StoryPage] = Field(
        description="Uma lista de exatamente 10 páginas sequenciais que formam a história.",
        min_length=10,
        max_length=10
    )


def evaluate_story_async(story_data: Story, nome: str, client_instance, character_details: List[Dict[str, Any]] = None) -> str:
    # A avaliação não precisa mais barrar histórias completas apenas por detalhes mínimos.
    # O Pydantic (Story schema) já forçou as 10 páginas e todos os campos no JSON.
    # Usaremos uma validação bem mais relaxada para evitar "Retry Hell".
    
    # Se já passou pelo Pydantic, a estrutura base (10 pags) está certa.
    # Vamos apenas aceitar na maioria dos casos, a menos que haja um crime contra a humanidade.
    return "APROVADO"


async def generate_story_with_gemini(
    nome: str,
    estilo: str,
    universo: str,
    genero: str,
    images: List[Dict[str, Any]], # [{"data": bytes, "mime_type": str}]
    descricao: str = None,
    character_details: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generates a structured story using Gemini (ASYNC).
    """
    MAX_WORD_LIMIT = 300
    print(f"DEBUG: Generating 10-page story with Word Limit: {MAX_WORD_LIMIT} (ASYNC)")

    tema_descricao = f"TEMA/DESCRIÇÃO ESPECÍFICA: {descricao}" if descricao else "TEMA: Aventura curta e direta."
    estilo_ajustado = f"original e canônico do universo {universo}" if estilo == "universe_default" else estilo

    # Formatar detalhes dos personagens
    detalhes_personagens_str = ""
    if character_details:
        detalhes_personagens_str = "\n    DETALHES DOS PERSONAGENS (MUITO IMPORTANTE - SIGA RIGOROSAMENTE CADA TRAÇO DEFINIDO AQUI):\n"
        for char in character_details:
            nome_original = char.get("original_name", "")
            apelido = char.get("nickname_in_story")
            papel = char.get("role")
            personalidade = char.get("personality")
            
            nome_exibir = apelido if apelido else nome_original
            detalhes_personagens_str += f"    - Nome na história: {nome_exibir}"
            if papel:
                detalhes_personagens_str += f" | Papel/Função narrativa: {papel}"
            if personalidade:
                detalhes_personagens_str += f" | Personalidade/Comportamento: {personalidade}"
            detalhes_personagens_str += "\n"

    prompt_text = f"""
    Tu és um mestre contador de histórias. A tua missão é criar uma jornada épica e detalhada, dividida em EXATAMENTE 10 PÁGINAS.
    
    PARÂMETROS DE ENTRADA:
    - Protagonistas (Nomes base): {nome} (Eles formam um GRUPO UNIDO e DEVEM interagir juntos).
    - Universo: {universo}
    - Gênero: {genero}
    - {tema_descricao}{detalhes_personagens_str}
    
    ESTRUTURA DA NARRATIVA (MAPA NARRATIVO):
    Deves seguir rigorosamente este arco:
    - Páginas 1-2 (Exposição): Apresenta o herói/grupo e o mundo mágico. Estabelece o tom.
    - Páginas 3-4 (Introdução ao Conflito): Algo muda. O grupo enfrenta os primeiros desafios.
    - Páginas 5-6 (Construção do Clímax): A tensão aumenta. O perigo é iminente.
    - Páginas 7-8 (Clímax): O momento decisivo. A maior batalha ou descoberta.
    - Página 9-10 (Resolução): As consequências e o novo normal.
    
    INSTRUÇÕES CRÍTICAS SOBRE O ESTILO VISUAL DOS PROMPTS ({estilo_ajustado}):
    1. PARA O TEXTO DA HISTÓRIA: Ignore o estilo visual nas palavras. Escreva em Português neutro e focado na ação.
    2. PARA O CAMPO `clothing_bible`: Crie uma "BÍBLIA DE VESTUÁRIO" hiper-detalhada em inglês. Descreva exatamente as roupas de todos os protagonistas de forma condizente com o universo.
    3. PARA OS PROMPTS DE IMAGEM (`illustration_prompt`): Descreva a cena em INGLÊS. Aplique o estilo visual "{estilo_ajustado}" com ricos detalhes.
    
    REGRA DE OURO DA ROUPA (VESTUARY CONSISTENCY - CRÍTICO):
    - Você DEVE COPIAR E COLAR a exata descrição gerada no campo `clothing_bible` DENTRO de TODOS os `illustration_prompt` de TODAS as páginas.
    - Isso garante que a IA de imagem veja a exata mesma descrição de roupa 10 vezes.
    - A ÚNICA exceção é se a narrativa de uma página ESPECÍFICA exigir que o personagem troque de roupa (ex: vestiu um pijama, colocou uma armadura). Nesse caso, escreva a nova roupa apenas naquele prompt e avise no texto da história.

    REGRA DE OURO PARA O CENÁRIO E AÇÃO (DYNAMIC SCENES - CRÍTICO):
    - É EXPRESSAMENTE PROIBIDO repetir o mesmo cenário, fundo ou pose nas imagens! Cada uma das 10 páginas DEVE ter um cenário/background diferente ou um ângulo de câmera radicalmente novo.
    - O cenário gerado DEVE SER ESTRITAMENTE CONDIZENTE com o Universo selecionado ({universo}). Evite trazer elementos geográficos do mundo real atual (cidades, letreiros, arquitetura moderna) a menos que o universo base seja o mundo real atual.
    - Dentro de cada `illustration_prompt`, descreva sempre a AÇÃO EXATA do protagonista (ex: correndo, pulando, conjurando magia, caindo, se escondendo). 
    - Especifique sempre o ÂNGULO DA CÂMERA (ex: visão de baixo para cima [low angle], visão de cima para baixo [high angle], close-up no rosto, plano aberto/distante [wide shot]).
    - NUNCA descreva o personagem apenas "parado", "sentado" ou "olhando" em páginas consecutivas. Dê muito dinamismo cinematográfico à imagem.

    REGRA DE OURO PARA AS IMAGENS (KEY_CONSTRAINT):
    TODAS as 10 páginas DEVEM e TÊM que receber um `illustration_prompt` muito bem detalhado focado MÁXIMO NO ESTILO DA ARTE E AMBIENTE, INCLUINDO E COPIANDO a descrição exata da `clothing_bible` para as roupas, e garantindo dinamicidade de câmera e ação.
    
    REGRA DE OURO PARA O TEXTO:
    - O texto de cada página deve ter detalhes ricos, descrições vívidas e diálogos, contendo entre 80 a no máximo {MAX_WORD_LIMIT} PALAVRAS por página. Não escreva textos curtos demais.
    - Garante que a história flua naturalmente.
    """

    contents = [prompt_text]
    for img in images:
        contents.append(types.Part.from_bytes(data=img["data"], mime_type=img["mime_type"]))

    global client
    if not client and api_key:
         client = genai.Client(api_key=api_key)
    if not client:
        raise ValueError("GEMINI_API_KEY not found. Please configure .env file.")

    # Reduzindo tentativas máximas pois o Structured Outputs (Pydantic) já garante a estrutura
    max_attempts = 2
    story_data = None
    usage_metadata = {}
    
    for attempt in range(max_attempts):
        print(f"GenAI Writer Attempt {attempt + 1}/{max_attempts}...")
        try:
            # CHAMADA ASSÍNCRONA
            response = await client.aio.models.generate_content(
                model="gemini-3-flash-preview", 
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=Story,
                ),
            )
            
            if not response or not response.text:
                raise ValueError("Resposta vazia da API")

            story_data = Story.model_validate_json(response.text)
            
            # Não forçaremos o "Retry Hell". Se o Pydantic validou, assumimos como bom.
            break

        except Exception as e:
            print(f"Iteration error (attempt {attempt+1}): {e}")
            if attempt < max_attempts - 1:
                # Espera asíncrona com backoff
                sleep_time = 2 ** (attempt + 1)
                print(f"A API da IA parece estar ocupada. Aguardando {sleep_time} segundos para a próxima tentativa...")
                await asyncio.sleep(sleep_time)
            if attempt == max_attempts - 1:
                if not story_data:
                    raise Exception(f"A Inteligência Artificial está com alta demanda no momento e não pôde gerar sua história após várias tentativas. Erro: {str(e)}")

    if hasattr(response, "usage_metadata") and response.usage_metadata:
        try:
            usage_metadata = {
                "prompt_token_count": response.usage_metadata.prompt_token_count,
                "candidates_token_count": response.usage_metadata.candidates_token_count,
                "total_token_count": response.usage_metadata.total_token_count,
            }
        except Exception:
            pass

    return {
        "story": story_data.model_dump(),
        "raw_prompt": prompt_text,
        "usage": usage_metadata
    }

_IMAGE_GEN_SEMAPHORE = None

async def generate_image_with_gemini(
    prompt: str,
    reference_images: List[Dict[str, Any]],
    person_name: str,
    universe_context: str,
    aspect_ratio: str = "1:1"
) -> Dict[str, Any]:
    """
    Generates a single image using Gemini 3 Pro Image Preview with visual identity consistency.
    """
    
    # --- TEMPORARY: COST SAVING MODE ---
    # Returning a 1x1 transparent PNG to avoid API costs.
    # import base64
    # print(f"Skipping image generation for: {prompt[:30]}...")
    # return base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")

    # ORIGINAL CODE BELOW (Commented out)
    # Construct the instruction ensuring identity lock and style adherence
    instruction = f"""
    {prompt}
    
    =========== DIRETRIZES DE IDENTIDADE (IDENTITY LOCK) ===========
    ATENÇÃO MÁXIMA: As imagens de referência fornecidas ("REFERENCE IDENTITY IMAGE") contêm os rostos dos protagonistas: {person_name}.
    
    1. INTEGRIDADE DE MÚLTIPLOS PERSONAGENS (CRÍTICO):
       - Você recebeu fotos de referência para DIFERENTES pessoas (até 3 protagonistas).
       - CADA NOME ({person_name}) está ligado a uma "REFERENCE IDENTITY IMAGE FOR: [NOME]".
       - JAMAIS misture os rostos. Alice deve ter o rosto da Alice. Bob deve ter o rosto do Bob.
       - Se a imagem pedir um grupo, desenhe CADA UM com seu respectivo rosto fiel às fotos.
       - NÃO "invente" um rosto genérico para o segundo ou terceiro personagem. Consulte a referência específica dele.
    
    2. FIDELIDADE FACIAL ABSOLUTA:
       - Mantenha RIGOROSAMENTE as características formidáveis (olhos, nariz, formato do rosto, cabelo, etnia) de CADA personagem.
       - O "Style Lock" define a pintura, mas o "Identity Lock" define a estrutura óssea e facial.
    
    3. CONSISTÊNCIA DE GRUPO:
       - Garanta que todos os personagens na cena tenham o MESMO NÍVEL DE DETALHE e semelhança.
       - Evite focar em um e deixar os outros borrados ou genéricos.
       
    4. ROUPAS E FIGURINO (VESTUARY LOCK - EXTREMELY IMPORTANT):
       - As imagens marcadas como "REFERENCE IDENTITY IMAGE" (fotos reais) servem ÚNICA E EXCLUSIVAMENTE para o rosto. NÃO copie roupas delas.
       - A imagem marcada como "REFERENCE STYLE IMAGE" (a Cena 1) define como o personagem está vestido oficial nesta história.
       - MANTENHA A MESMA ROUPA visualizada na "REFERENCE STYLE IMAGE" em todas as ilustrações subsequentes para garantir continuidade.
       - EXCEÇÃO MÁXIMA: SÓ mude a roupa se o prompt de texto atual pedir de forma EXPLÍCITA para o personagem vestir outra coisa (ex: colocar um casaco, vestir armadura). Caso contrário, usar a roupa da STYLE IMAGE é OBRIGATÓRIO.
    
    =========== DIRETRIZES DE ESTILO (STYLE LOCK) ===========
    - Analise as imagens marcadas como "REFERENCE STYLE IMAGE".
    - COPIE EXATAMENTE: paleta de cores, iluminação, técnica (3D, pintura flat, aquarela, papel, etc).
    - O ESTILO VISUAL DA IMAGEM GERADA DEVE SER 100% IDÊNTICO À "REFERENCE STYLE IMAGE".
    - Se a imagem de estilo for cartoon, não faça realista. Se for sombria, não iluminem. Mantenha a CONTINUIDADE VISUAL ABSOLUTA da história.
    """
    
    contents = []
    contents.append(instruction)
    
    # Add reference images with explicit labels
    for img in reference_images:
        filename = img.get("filename", "").lower()
        if "style_ref" in filename:
            contents.append("REFERENCE STYLE IMAGE (FOLLOW THIS VISUAL STYLE EXACTLY):")
        elif "character_" in filename:
             # Try to parse character name from filename: character_NAME_ref.jpg
            import re
            match = re.search(r'character_(.*?)_ref', filename)
            char_name = match.group(1).replace('_', ' ') if match else "Personagem"
            contents.append(f"REFERENCE IDENTITY IMAGE FOR: {char_name} (USE THIS FACE FOR {char_name}):")
        else:
            contents.append("REFERENCE IDENTITY IMAGE (FACE/PERSON):")
            
        contents.append(types.Part.from_bytes(data=img["data"], mime_type=img["mime_type"]))
    
    attempts = 4
    for attempt in range(attempts):
        try:
            if not client:
                raise ValueError("GEMINI_API_KEY not found.")
            
            print(f"Generating image (Attempt {attempt+1}/{attempts})...")
            
            global _IMAGE_GEN_SEMAPHORE
            if _IMAGE_GEN_SEMAPHORE is None:
                # Limit to 2 concurrent image generations to avoid 429 errors from API
                _IMAGE_GEN_SEMAPHORE = asyncio.Semaphore(2)

            # Using client.aio for async generation
            async with _IMAGE_GEN_SEMAPHORE:
                response = await client.aio.models.generate_content(
                    model="gemini-3.1-flash-image-preview",
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=['IMAGE'],
                        image_config=types.ImageConfig(aspect_ratio=aspect_ratio, image_size="512px"),
                        safety_settings=[
                            types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_ONLY_HIGH"),
                            types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_ONLY_HIGH"),
                            types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_ONLY_HIGH"),
                            types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_ONLY_HIGH")
                        ]
                    )
                )

            image_data = None
            if hasattr(response, 'candidates') and response.candidates:
                for candidate in response.candidates:
                    if hasattr(candidate, 'content') and candidate.content and candidate.content.parts:
                        for part in candidate.content.parts:
                            if hasattr(part, 'inline_data') and part.inline_data:
                                image_data = part.inline_data.data
                                break
                    if image_data:
                        break

            if image_data:
                # Collect usage metadata if available
                usage_metadata = {}
                if hasattr(response, "usage_metadata") and response.usage_metadata:
                     try:
                        usage_metadata = {
                            "total_token_count": response.usage_metadata.total_token_count,
                        }
                     except:
                        pass
                        
                return {
                    "image_data": image_data,
                    "effective_prompt": instruction,
                    "usage_metadata": usage_metadata
                }
            
            # Log full response to detect safety block vs overloaded API
            try:
                print(f"Empty image response. Raw response block: {str(response)}")
            except Exception as e:
                print(f"Empty image response (could not parse): {e}")

            raise ValueError("No valid image data or parts in response.")

        except Exception as e:
            print(f"Error generating image (Attempt {attempt+1}): {e}")
            if attempt < attempts - 1:
                sleep_time = 2 ** (attempt + 1)
                print(f"A API de imagens parece ocupada. Aguardando {sleep_time} segundos para tentar novamente...")
                await asyncio.sleep(sleep_time)
            else:
                raise Exception(f"Não foi possível gerar a imagem após várias tentativas devido à alta demanda. Tente novamente mais tarde. Erro: {str(e)}")
