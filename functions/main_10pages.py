import os
import io
import json
import base64
import uuid
from typing import List, Dict, Any, Optional
from PIL import Image
from dotenv import load_dotenv
from firebase_functions import https_fn, options
from firebase_admin import initialize_app, firestore
from pydantic import BaseModel, Field

try:
    from functions.style_guide import get_llm_style_instructions, format_gpt_image_prompt, get_style_definition
except ImportError:
    from style_guide import get_llm_style_instructions, format_gpt_image_prompt, get_style_definition

def prepare_image_buffer(img_bytes: bytes, filename: str = "ref.png") -> io.BytesIO:
    try:
        pil_img = Image.open(io.BytesIO(img_bytes))
        if pil_img.mode not in ("RGB", "RGBA"):
            pil_img = pil_img.convert("RGB")
        elif pil_img.mode == "RGBA":
            bg = Image.new("RGB", pil_img.size, (255, 255, 255))
            bg.paste(pil_img, mask=pil_img.split()[-1])
            pil_img = bg
        buf = io.BytesIO()
        pil_img.save(buf, format="PNG")
        buf.name = filename if filename.endswith(".png") else f"{filename}.png"
        buf.seek(0)
        return buf
    except Exception as e:
        buf = io.BytesIO(img_bytes)
        buf.name = filename
        buf.seek(0)
        return buf

# Aumenta limite de memória por campo de formulário do Werkzeug de 500KB para 15MB
try:
    https_fn.Request.max_form_memory_size = 15 * 1024 * 1024
except Exception as e:
    print("Aviso ao configurar max_form_memory_size:", e)

# Load environment
load_dotenv(override=True)
try:
    initialize_app()
except Exception:
    pass

DAILY_LIMIT = int(os.getenv("DAILY_STORY_LIMIT", "3"))
ADMIN_EMAILS = [email.strip().lower() for email in os.getenv("ADMIN_EMAILS", "luca.barboza@gmail.com,ricardo8610@gmail.com").split(",")]

# Pydantic models for OpenAI Structured Outputs
class StoryPage(BaseModel):
    page_number: int = Field(description="O número da página, de 1 a 10.")
    text: str = Field(
        description="Texto literário da página contendo entre 100 e 130 palavras, OBRIGATORIAMENTE EM PORTUGUÊS DO BRASIL (PT-BR). NUNCA EM INGLÊS! Estruturado em EXATAMENTE 2 parágrafos substanciais e envolventes separados por quebra dupla (\\n\\n): 1º Parágrafo de ambientação sensorial e presença dos heróis no momento presente (~50-65 palavras), e 2º Parágrafo de desenvolvimento (ação, exploração ou diálogo espontâneo com travessão se couber) fechando com um gancho intrigante para a próxima página (~50-65 palavras)."
    )
    illustration_prompt: str = Field(
        description="Prompt de imagem super detalhado em inglês descrevendo a cena para a ilustração da página. REGRA ABSOLUTA: NUNCA inclua balões de fala, diálogos, textos, palavras, letras, banners ou títulos dentro da imagem. A ilustração deve ser 100% puramente visual (wordless picture book illustration)."
    )

class CastMember(BaseModel):
    name: str = Field(description="Nome do personagem")
    photo_index: int = Field(description="Índice da foto de referência correspondente [1 a 3]")
    is_pet: bool = Field(description="True se for animal/pet quadrúpede, False se for ser humano")
    role: str = Field(description="Papel do herói na narrativa (ex: protagonista principal, companheiro fiel)")
    visual_traits: str = Field(description="Traços visuais positivos extraídos diretamente da foto (gênero, idade aproximada, cabelo, óculos se humano; espécie/raça, pelagem, orelhas, focinho se pet)")

class Story(BaseModel):
    title: str = Field(description="O título épico e chamativo da história, OBRIGATORIAMENTE EM PORTUGUÊS DO BRASIL (PT-BR). NUNCA EM INGLÊS!")
    cast: List[CastMember] = Field(description="Elenco principal formado estritamente pelos 1 a 3 personagens das fotos de referência.")
    cover_prompt: str = Field(description="Prompt detalhado em inglês para gerar a ilustração da capa do livro. REGRA ABSOLUTA: NÃO inclua títulos escritos, textos ou balões na imagem (wordless illustration, no text, no title).")
    character_appearance_bible: str = Field(default="", description="Descrição física detalhada dos personagens baseada ESTRITAMENTE nas fotos enviadas (espécie: animal/pet vs humano, gênero, cabelo, óculos, porte e traços marcantes).")
    clothing_bible: str = Field(description="Descrição detalhada em inglês das roupas e características visuais dos heróis para manter a consistência.")
    pages: List[StoryPage] = Field(description="Lista com exatamente 10 páginas sequenciais que formam a história.")


cors_options = options.CorsOptions(cors_origins=["*"], cors_methods=["get", "post", "options"])

@https_fn.on_request(timeout_sec=300, memory=1024, concurrency=1, max_instances=20, cors=cors_options)
def api(req: https_fn.Request) -> https_fn.Response:
    """
    Roteador da API principal para geração de histórias e imagens via OpenAI.
    Suporta /api/generate-story, /api/generate-image e /api/save-story.
    """
    import openai
    import requests
    from PIL import Image

    path = req.path.replace("/api", "").rstrip("/")
    if not path:
        path = "/"

    if req.method == "OPTIONS":
        return https_fn.Response("", status=204)

    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY não configurada no ambiente do Firebase Functions.")
        client = openai.OpenAI(api_key=api_key)

        # -------------------------------------------------------------
        # 1. ROTA: GENERATE-STORY (GPT-4o-mini com Structured Outputs)
        # -------------------------------------------------------------
        if path == "/generate-story":
            nome = req.form.get("nome", "Herói")
            estilo = req.form.get("estilo", "universe_default")
            universo = req.form.get("universo", "medieval")
            genero = req.form.get("genero", "aventura")
            descricao = req.form.get("descricao")
            
            character_details_str = ""
            details_json = req.form.get("character_details_json")
            if details_json:
                try:
                    details = json.loads(details_json)
                    if isinstance(details, list) and len(details) > 0:
                        char_lines = []
                        for c in details:
                            c_name = c.get("nickname_in_story") or c.get("original_name", "Herói")
                            c_type = c.get("character_type", "person")
                            c_breed = c.get("species_breed")
                            if c_type == "pet":
                                breed_info = f" ({c_breed})" if c_breed else " (Animal/Pet de 4 patas)"
                                char_lines.append(f"- {c_name}: ANIMAL DE ESTIMAÇÃO / PET{breed_info}. Quadrúpede companheiro leal! NUNCA transforme em humano!")
                            else:
                                char_lines.append(f"- {c_name}: SER HUMANO (Protagonista). Papel: {c.get('role', 'Aventureiro')}, Personalidade: {c.get('personality', 'Corajoso')}")
                        character_details_str = "\nELENCO DETALHADO (HUMANO vs PET):\n" + "\n".join(char_lines) + "\n"
                except Exception as parse_err:
                    print("Aviso ao processar character_details_json:", parse_err)

            tema = f"TEMA ESPECÍFICO: {descricao}" if descricao else "TEMA: Uma grande jornada mágica e surpreendente."
            style_directive = get_llm_style_instructions(estilo, universo)

            system_prompt = f"""Você é um renomado autor brasileiro de literatura infantil e Diretor de Fotografia Cinematográfica.
Sua missão é criar uma história completa dividida em EXATAMENTE 10 PÁGINAS, ESCRITA INTEGRALMENTE EM PORTUGUÊS DO BRASIL (PT-BR), com ilustrações dinâmicas, cinematográficas e ultra-detalhadas.

================================================================================
REGRA ZERO E FUNDAMENTAL DE IDIOMA (PORTUGUÊS DO BRASIL OBRIGATÓRIO):
- O título (`title`) e o texto completo das 10 páginas (`text`) DEVEM SER 100% EM PORTUGUÊS DO BRASIL (PT-BR)!
- É TERMINANTEMENTE PROIBIDO gerar o texto da história em inglês, espanhol ou qualquer outro idioma! NUNCA ESCREVA A HISTÓRIA EM INGLÊS!
- O leitor é uma criança brasileira, toda a narrativa, descrições e falas são EXCLUSIVAMENTE em português perfeito e fluente.
- Apenas os prompts técnicos de imagem (`illustration_prompt`, `cover_prompt`, `clothing_bible`) são redigidos em inglês para a IA geradora de imagens.
================================================================================

REGRA ABSOLUTA: IMAGENS PURAMENTE VISUAIS (SEM BALÕES DE FALA E SEM NENHUM TEXTO):
- As ilustrações NÃO PODEM CONTER NENHUM TIPO DE TEXTO: sem balões de fala (no speech bubbles), sem balões de diálogo, sem banners, sem títulos gravados na arte, sem palavras escritas.
- O livro é ilustrado e diagramado: o texto da história já aparece na página do leitor. A arte deve ser 100% LIMPA E PURAMENTE VISUAL!
- Em todos os `illustration_prompt` e no `cover_prompt`, SEMPRE inclua a instrução explícita: "wordless picture book illustration, strictly no speech bubbles, no dialogue, no text, no lettering".
================================================================================

PARÂMETROS DE ENTRADA:
- Protagonistas: {nome} (Eles formam um grupo unido e inseparável).
- Universo: {universo}
- Gênero: {genero}
- Estilo Artístico Alvo: {estilo}
- {tema}
{character_details_str}

================================================================================
MAPEAMENTO DO ELENCO PRINCIPAL BASEADO NAS FOTOS [1 A 3]:
- Os heróis protagonistas da história são exclusivamente os indivíduos apresentados nas fotos de referência ({nome}).
- Cada protagonista herda sua identidade visual e física diretamente de sua respectiva foto [1 a 3]:
  * Protagonista Humano: preserva fisionomia real, gênero (masculino/feminino), idade aparente, cabelo e óculos da sua foto.
  * Pet/Companheiro: preserva a anatomia autêntica da espécie e raça da sua foto (animal quadrúpede leal).
- Figurantes de ambientação (guardas, aldeões, mercadores, transeuntes) podem existir normalmente no plano de fundo quando o cenário pedir, enquanto os protagonistas conduzem o primeiro plano.
================================================================================

DIRETRIZ CRÍTICA DE ESTILO VISUAL:
{style_directive}

DIRETRIZ DE CINEMATOGRAFIA & LIBERDADE NARRATIVA TOTAL (A HISTÓRIA GUIA A CENA):
A magia de cada livro está na sua originalidade! Cenários, ações, adereços e clima visual DEVEM nascer 100% da história e do tema do universo '{universo}' que você estiver desenvolvendo.
Seja uma aventura espacial, culinária mágica, mistério na floresta, expedição subaquática ou fantasia antiga, crie situações autênticas e únicas para cada página, sem amarras ou fórmulas fixas!

Para garantir que o livro seja visualmente espetacular, dinâmico e NUNCA sofra de poses ou fundos monótonos e repetidos, aplique as 5 LEIS DA DIREÇÃO DE FOTOGRAFIA:

1. A HISTÓRIA DITA A POSE (AÇÃO VIVA E EXPRESSIVA):
   - A pose e a postura dos protagonistas ({nome}) em cada ilustração devem capturar o ápice dramático, divertido ou curioso do que está acontecendo no texto daquela página (ex: se estão correndo de uma tempestade, mostre correria veloz; se descobriram um segredo, mostre admiração e curiosidade; se estão comemorando, mostre pulos de alegria; se estão voando, remando ou criando algo, mostre essa atividade física em ação!).
   - PROTAGONISTAS EM AÇÃO: Os heróis estão sempre engajados em ações vivas e expressivas que refletem sua jornada.

2. REGRA DE OURO DA NÃO-REPETIÇÃO ADJACENTE (ANTI-MONOTONIA):
   - NUNCA repita a mesma postura corporal em páginas consecutivas! Se em uma página o herói estiver abaixado observando algo, na página seguinte ele DEVE estar ereto, em movimento dinâmico, correndo, saltando ou em uma atitude corporal totalmente distinta.
   - Poses baixas (agachado/no chão) só são permitidas se o texto exigir expressamente uma ação rente ao solo (como buscar algo na grama). NUNCA faça disso a pose padrão da história!

3. RITMO VISUAL & TOOLKIT CINEMATOGRÁFICO (DIVERSIDADE DE PLANOS):
   Ao longo das 10 páginas, alterne dinamicamente entre pelo menos 5 enquadramentos e ângulos visuais diferentes, guiados pela emoção da cena:
   * [Establishing Wide Shot] / [Cinematic Vista]: Planos abertos para mostrar a grandeza do ambiente, horizontes épicos ou a chegada a um novo cenário.
   * [Dynamic Medium Shot] / [Action Tracking]: Planos médios capturando os personagens em deslocamento ou ação coordenada ativa.
   * [Tight Reaction Close-Up] / [Intimate Medium Close-Up]: Planos fechados focados na expressão de alegria, espanto, carinho ou o detalhe de um objeto luminoso.
   * [Dramatic Low-Angle / Worm's Eye]: Ângulos de baixo para cima para transmitir grandiosidade, heroísmo ou imponência.
   * [High-Angle / Bird's Eye View]: Ângulos aéreos ou picados observando a cena de cima (do topo de uma árvore, telhado ou colina).
   * [Dynamic Dutch-Angle Tilt]: Câmera levemente inclinada para momentos de velocidade, surpresa ou adrenalina.
   * [Silhouette Rim-Light]: Personagens em contra-luz ou silhueta dramática diante de uma luz brilhante (sol nascente, portal, fogueira).

4. COMPOSIÇÃO DINÂMICA & EVOLUÇÃO DE CENÁRIOS:
   - ALTERNÂNCIA DE QUADRANTES: NUNCA posicione os personagens sempre no mesmo canto da tela (proibido ficar sempre no canto inferior esquerdo). Alterne: centro, terço direito, terço esquerdo, primeiro plano ou silhuetados à distância.
   - EVOLUÇÃO VISUAL DOS FUNDOS: O ambiente deve progredir organicamente com a jornada narrada (mudanças de iluminação como manhã, tarde, entardecer e noite; transições entre cômodos, áreas externas, clareiras, oficinas, novos horizontes). NUNCA repita a mesma arquitetura de fundo ou marco geográfico idêntico em páginas diferentes.

5. PROTAGONISMO CLARO E FIGURANTES DE CENÁRIO:
   - Os personagens em foco no primeiro plano são exclusivamente os heróis ({nome}) derivados das fotos [1 a 3].
   - Figurantes, cavaleiros, aldeões, transeuntes ou multidões são naturais no plano de fundo para dar vida e escala ao mundo, mantendo a ação principal sempre nos heróis.
   - Para duplas (humano + pet), retrate sua cumplicidade ativa (o pet como companheiro leal de 4 patas interagindo com o tutor humano).

ESTRUTURA OBRIGATÓRIA DO `illustration_prompt` (120-180 PALAVRAS EM INGLÊS):
Cada uma das 10 páginas DEVE ter um prompt visual rico, denso e cinematográfico em inglês (~120 a 180 palavras) estruturado em 5 camadas:
1. [Camera Shot & Angle Tag]: A tag do enquadramento escolhido (ex: '[Dynamic Dutch-Angle Low Shot, 20-Degree Horizon Tilt]' ou '[Atmospheric Tight Ground Shot]').
2. Foreground Elements: Elementos táteis próximos à lente (pedras cobertas de musgo, folhas suspensas ao vento, fagulhas brilhantes, névoa rasteira).
3. Midground Subject & Kinetic Action: Os protagonistas ({nome}) em ação coordenada (ex: o herói humano em pose dinâmica ativa e seu companheiro pet ao seu lado em pose animal expressiva, com roupas/arreios condizentes da `clothing_bible` e anatomia exata da `character_appearance_bible`).
4. Background Architecture & Atmosphere: Cenário específico e ÚNICO daquela página (sem repetir o mesmo castelo ou mesma montanha!).
5. Volumetric Lighting & Atmospheric FX: Luz volumétrica, cores crepusculares ou bioluminescência condizentes com o estilo '{estilo}'.
Finalize SEMPRE com: "wordless picture book illustration, strictly no speech bubbles, no dialogue, no text, no lettering".

REGRAS OBRIGATÓRIAS DE CONTEÚDO:
1. `character_appearance_bible`: Inspecione minuciosamente as fotos em anexo dos personagens ({nome}). Identifique a ESPÉCIE E ANATOMIA REAL (se pet: raça exata, pelagem, manchas, orelhas, focinho, patas, rabo; se humano: idade, cabelo, pele e traços faciais). NUNCA transforme animal em humano nem humano em animal!
2. `clothing_bible`: Descreva em inglês trajes e acessórios adequados à anatomia e universo para cada herói.
3. `cover_prompt`: Descreva em inglês (~120-150 palavras) uma cena épica e monumental para a capa (formato wide 16:9) com tag '[Epic Wide Panoramic Cover Vista]', incluindo os personagens ({nome}) juntos com a fisionomia da `character_appearance_bible` e `clothing_bible`. Wordless illustration, strictly no text or titles on cover.
4. `pages`: EXATAMENTE 10 páginas com `page_number`, `text` e `illustration_prompt` ultra-detalhado (120-180 palavras em inglês).
5. REGRA DO TEXTO (OBRIGATÓRIO: EXATAMENTE 2 PARÁGRAFOS — ENTRE 100 E 130 PALAVRAS POR PÁGINA — EM PORTUGUÊS DO BRASIL):
   - Texto 100% EM PORTUGUÊS DO BRASIL (PT-BR). NUNCA EM INGLÊS.
   - Cada uma das 10 páginas DEVE ter rigorosamente entre 100 e 130 palavras no total, dividida em EXATAMENTE 2 parágrafos separados por \n\n (~50 a 65 palavras por parágrafo). Narrativa envolvente em tempo real ("Show, don't tell"). Diálogos livres e orgânicos (use travessão '—' apenas se enriquecer a cena).

PADRÃO ESTRUTURAL EXIGIDO DE UMA PÁGINA (EXATAMENTE 2 PARÁGRAFOS — ~115 PALAVRAS — EM PORTUGUÊS DO BRASIL):
"A luz dourada da alvorada filtrava-se por entre a névoa suave, revelando pegadas misteriosas gravadas no chão de pedra antiga. O jovem herói examinava com atenção as marcas recentes, com o olhar decidido e a respiração compassada, enquanto seu leal companheiro ao lado farejava cada centímetro da relíquia encontrada, com as orelhas em pé e as patinhas firmes na terra úmida.

— Encontramos a primeira pista da nossa jornada! — sussurrou o viajante, guardando o pergaminho seguro na algibeira. O pequeno companheiro soltou um latido abafado de entusiasmo, pronto para qualquer desafio que surgisse, enquanto uma suave brisa movia os arbustos ao longe, indicando o início de uma grande travessia." """

            user_content = [
                {"type": "text", "text": f"Crie agora a história de 10 páginas EM PORTUGUÊS DO BRASIL (PT-BR) para os personagens {nome} no universo {universo} com estilo visual {estilo}.\n\nATENÇÃO MÁXIMA DE IDIOMA: O título e o texto de cada uma das 10 páginas DEVEM ser 100% em português brasileiro, jamais em inglês!\n\nFIDELIDADE POSITIVA AOS PROTAGONISTAS [1 A 3]: O elenco principal é formado estritamente pelos heróis das fotos ({nome}). Se for uma dupla humano + pet, eles conduzem a aventura juntos em primeiro plano do início ao fim. Figurantes e habitantes do mundo podem aparecer naturalmente ao fundo quando a narrativa pedir.\n\nMETA CRÍTICA DE EXTENSÃO: Cada uma das 10 páginas DEVE ter OBRIGATORIAMENTE entre 100 e 130 palavras, estruturada em EXATAMENTE 2 PARÁGRAFOS envolventes e equilibrados (~50 a 65 palavras por parágrafo, separados por \\n\\n), com narrativa em tempo real ('Show, don't tell'). Estilo livre para diálogos (use travessão '—' apenas se fizer sentido para a cena). É ESTRITAMENTE PROIBIDO gerar páginas com 1 só parágrafo ou com 3 parágrafos!\n\nDIREÇÃO CINEMATOGRÁFICA & PROMPTS ULTRA-DETALHADOS (A HISTÓRIA GUIA A CENA COM DIVERSIDADE VISUAL):\nComo Diretor de Fotografia, redija para cada página um `illustration_prompt` ultra-detalhado em inglês (~120 a 180 palavras) com tag de câmera ([Camera Shot Tag]). PROIBIÇÃO DE MONOTONIA E POSES REPETIDAS: Os heróis ({nome}) NÃO PODEM ficar na mesma posição corporal ou no mesmo canto da tela ao longo das páginas! A cena, os cenários e as poses DEVEM nascer organicamente dos acontecimentos do texto de cada página. NUNCA repita a mesma postura corporal em páginas consecutivas e NUNCA deixe os personagens sempre agachados ou no mesmo canto inferior esquerdo. Alterne os ângulos de câmera (plano aberto, médio, close-up, low-angle, high-angle) e a lateralidade (esquerda, centro, direita). Para multi-personagens, SEMPRE descreva ambos juntos interagindo com naturalidade e expressividade!\n\nINSPEÇÃO VISUAL OBRIGATÓRIA DAS FOTOS EM ANEXO (FIDELIDADE RIGOROSA DE GÊNERO E ESPÉCIE):\nExamine atenta e minuciosamente as fotos fornecidas em anexo, associando cada uma ao seu personagem rotulado:\n- Se o personagem for SER HUMANO: identifique com precisão o GÊNERO REAL (homem/menino vs mulher/menina), idade, tom de pele, cor e textura do cabelo, e se usa óculos. NUNCA TROQUE O GÊNERO! Se a foto for de um homem/garoto, ele DEVE ser retratado expressamente como masculino (jovem, garoto, rapaz) na história, na bíblia de aparência e em todos os prompts visuais. Se for mulher/garota, retrate como feminino.\n- Se o personagem for PET/ANIMAL: ele DEVE ser um animal quadrúpede autêntico (como cachorro Pug), com focinho, orelhas e pelagem reais das fotos. NUNCA transforme em humano!\n- Preencha `character_appearance_bible` detalhando explicitamente esses traços reais (ex: 'Luca: jovem masculino de cabelo escuro cacheado com óculos') e garanta que cada `illustration_prompt` descreva o protagonista com seu gênero e características visuais exatas.\n\nNas ilustrações, NUNCA coloque balões de fala, textos ou letras. Arte puramente visual!"}
            ]

            # Injetar fotos rotuladas se fornecidas
            urls_json = req.form.get("image_urls_json")
            if urls_json:
                try:
                    urls = json.loads(urls_json)
                    if isinstance(urls, list):
                        for idx, item in enumerate(urls[:3]):
                            u = item.get("url") if isinstance(item, dict) else item
                            c_name = item.get("name", f"Personagem {idx+1}") if isinstance(item, dict) else f"Personagem {idx+1}"
                            c_type = item.get("character_type", "person") if isinstance(item, dict) else "person"
                            c_breed = item.get("species_breed") if isinstance(item, dict) else None
                            type_str = f"Pet/Animal ({c_breed})" if c_type == "pet" else "Ser Humano"
                            if u:
                                try:
                                    r = requests.get(u, timeout=10)
                                    if r.status_code == 200:
                                        b64 = base64.b64encode(r.content).decode("utf-8")
                                        user_content.append({"type": "text", "text": f"[Foto {idx+1}: {c_name} ({type_str})]:"})
                                        user_content.append({
                                            "type": "image_url",
                                            "image_url": {"url": f"data:image/jpeg;base64,{b64}", "detail": "high"}
                                        })
                                except Exception as err_dl:
                                    print("Aviso ao baixar imagem para story:", err_dl)
                except Exception:
                    pass

            uploaded_imgs = req.files.getlist("imagens")
            if uploaded_imgs:
                for idx, f in enumerate(uploaded_imgs[:3]):
                    content = f.read()
                    b64 = base64.b64encode(content).decode("utf-8")
                    user_content.append({"type": "text", "text": f"[Foto de Upload {idx+1}]:"})
                    user_content.append({
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{b64}", "detail": "high"}
                    })

            completion = client.beta.chat.completions.parse(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                response_format=Story,
                temperature=0.8
            )

            story_obj = completion.choices[0].message.parsed
            if not story_obj:
                refusal = completion.choices[0].message.refusal
                raise ValueError(f"O modelo recusou a geração: {refusal}")

            usage = completion.usage
            response_payload = {
                "status": "sucesso",
                "mensagem": "História gerada com sucesso!",
                "data": {
                    "story": story_obj.model_dump(),
                    "raw_prompt": system_prompt,
                    "usage": {
                        "prompt_token_count": usage.prompt_tokens if usage else 0,
                        "candidates_token_count": usage.completion_tokens if usage else 0,
                        "total_token_count": usage.total_tokens if usage else 0,
                    }
                }
            }
            return https_fn.Response(json.dumps(response_payload), mimetype="application/json")

        # -------------------------------------------------------------
        # 2. ROTA: GENERATE-IMAGE (GPT-Image-2.5 Flare em qualidade Low)
        # -------------------------------------------------------------
        elif path == "/generate-image":
            prompt = req.form.get("prompt", "")
            person_name = req.form.get("person_name", "")
            universe_context = req.form.get("universe_context", "fantasy_medieval")
            style = req.form.get("style", "universe_default")
            is_cover_param = req.form.get("is_cover")
            is_cover = is_cover_param.lower() == "true" if is_cover_param else ("capa" in prompt.lower() or "cover" in prompt.lower())
            clothing_bible = req.form.get("clothing_bible")
            character_appearance_bible = req.form.get("character_appearance_bible")

            char_buffers = []
            style_buffers = []

            # 0. Processar detalhes dos personagens (humano vs pet)
            character_details = None
            char_details_json = req.form.get("character_details_json")
            if char_details_json:
                try:
                    character_details = json.loads(char_details_json)
                except Exception as e:
                    print("Aviso ao carregar character_details_json:", e)

            # 1. Processar uploaded files
            uploaded_files = req.files.getlist("reference_images")
            if uploaded_files:
                for idx, f in enumerate(uploaded_files):
                    content = f.read()
                    fname = f.filename.lower() if f.filename else ""
                    if "style" in fname or "anchor" in fname:
                        style_buffers.append(prepare_image_buffer(content, f"style_{idx}.png"))
                    else:
                        char_buffers.append(prepare_image_buffer(content, f"char_{idx}.png"))

            # 2. Processar URLs de referência
            urls_json = req.form.get("reference_image_urls_json")
            if urls_json:
                try:
                    urls = json.loads(urls_json)
                    if not character_details and isinstance(urls, list):
                        character_details = []
                        for item in urls:
                            if isinstance(item, dict):
                                character_details.append({
                                    "name": item.get("name"),
                                    "character_type": item.get("character_type") or item.get("type", "person"),
                                    "species_breed": item.get("species_breed")
                                })
                    if isinstance(urls, list):
                        for idx, item in enumerate(urls[:3]):
                            u = item.get("url") if isinstance(item, dict) else item
                            if u:
                                try:
                                    r = requests.get(u, timeout=10)
                                    if r.status_code == 200:
                                        char_buffers.append(prepare_image_buffer(r.content, f"char_url_{idx}.png"))
                                except Exception as dl_err:
                                    print(f"Erro baixando ref {u}: {dl_err}")
                except Exception:
                    pass

            # 3. Processar style reference url
            style_ref_url = req.form.get("style_reference_url")
            if style_ref_url and style_ref_url.startswith("http"):
                try:
                    r = requests.get(style_ref_url, timeout=10)
                    if r.status_code == 200:
                        style_buffers.append(prepare_image_buffer(r.content, "style_anchor.png"))
                except Exception as s_err:
                    print(f"Erro baixando style ref: {s_err}")

            selected_style = style_buffers[:1]
            has_style_ref = len(selected_style) > 0
            max_chars = 2 if has_style_ref else 3
            selected_chars = char_buffers[:max_chars]
            char_ref_count = len(selected_chars)
            image_buffers = selected_chars + selected_style

            target_size = "1536x1024" if is_cover else "1024x1536"
            instruction = format_gpt_image_prompt(
                base_prompt=prompt,
                style_id=style,
                universe_id=universe_context,
                person_name=person_name,
                clothing_bible=clothing_bible,
                character_appearance_bible=character_appearance_bible,
                is_cover=is_cover,
                has_photo_ref=char_ref_count > 0,
                char_ref_count=char_ref_count,
                has_style_ref=has_style_ref,
                character_details=character_details
            )

            img_model = os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-2.5-flare")
            img_quality = os.getenv("OPENAI_IMAGE_QUALITY", "low")

            def run_gen(current_prompt: str):
                if image_buffers:
                    for b in image_buffers:
                        b.seek(0)
                    img_arg = image_buffers if len(image_buffers) > 1 else image_buffers[0]
                    return client.images.edit(
                        model=img_model,
                        image=img_arg,
                        prompt=current_prompt,
                        size=target_size,
                        quality=img_quality
                    )
                else:
                    return client.images.generate(
                        model=img_model,
                        prompt=current_prompt,
                        size=target_size,
                        quality=img_quality
                    )

            img_res = None
            try:
                img_res = run_gen(instruction)
            except Exception as gen_err:
                err_text = str(gen_err).lower()
                if "moderation_blocked" in err_text or "safety" in err_text or "policy" in err_text:
                    print(f"WARN: Moderation triggered on image gen. Retrying with safe prompt...")
                    safe_prompt = f"A heroic, action-packed cinematic adventure scene in {universe_context} with {person_name} standing bravely and powerfully, cinematic highlights, vibrant colors, in {style} style."
                    safe_inst = format_gpt_image_prompt(
                        base_prompt=safe_prompt,
                        style_id=style,
                        universe_id=universe_context,
                        person_name=person_name,
                        clothing_bible=clothing_bible,
                        character_appearance_bible=character_appearance_bible,
                        is_cover=is_cover,
                        has_photo_ref=char_ref_count > 0,
                        char_ref_count=char_ref_count,
                        has_style_ref=False,  # Remove âncora anterior que pode ter conteúdo escuro bloqueado
                        character_details=character_details
                    )
                    try:
                        if char_buffers:
                            for b in char_buffers:
                                b.seek(0)
                            img_arg = char_buffers if len(char_buffers) > 1 else char_buffers[0]
                            img_res = client.images.edit(
                                model=img_model,
                                image=img_arg,
                                prompt=safe_inst,
                                size=target_size,
                                quality=img_quality
                            )
                        else:
                            img_res = client.images.generate(
                                model=img_model,
                                prompt=safe_inst,
                                size=target_size,
                                quality=img_quality
                            )
                    except Exception as mod_err2:
                        print(f"WARN: Second moderation trigger ({mod_err2}). Final fallback to safe text-to-image...")
                        wholesome_inst = format_gpt_image_prompt(
                            base_prompt=f"An inspiring epic adventure portrait of {person_name} in {universe_context}, colorful and vibrant in {style} style.",
                            style_id=style,
                            universe_id=universe_context,
                            person_name=person_name,
                            is_cover=is_cover,
                            has_photo_ref=False,
                            character_details=character_details
                        )
                        img_res = client.images.generate(
                            model=img_model,
                            prompt=wholesome_inst,
                            size=target_size,
                            quality=img_quality
                        )
                else:
                    raise gen_err

            first_data = img_res.data[0]
            if hasattr(first_data, "b64_json") and first_data.b64_json:
                data_url = f"data:image/png;base64,{first_data.b64_json}"
            elif hasattr(first_data, "url") and first_data.url:
                r_img = requests.get(first_data.url, timeout=20)
                b64_str = base64.b64encode(r_img.content).decode("utf-8")
                data_url = f"data:image/png;base64,{b64_str}"
            else:
                raise ValueError("Nenhum dado de imagem retornado pela OpenAI.")

            return https_fn.Response(json.dumps({
                "status": "sucesso",
                "image_url": data_url,
                "generation_log": {
                    "model": img_model,
                    "quality": img_quality,
                    "size": target_size,
                    "estimated_cost_usd": 0.005
                }
            }), mimetype="application/json")

        # -------------------------------------------------------------
        # 3. ROTA: SAVE-STORY
        # -------------------------------------------------------------
        elif path == "/save-story":
            new_id = str(uuid.uuid4())
            return https_fn.Response(json.dumps({
                "status": "sucesso",
                "story_id": new_id
            }), mimetype="application/json")

        elif path == "/test-firestore":
            try:
                db_client = firestore.client()
                doc_ref = db_client.collection("_healthcheck").document("ping")
                doc_ref.set({"timestamp": firestore.SERVER_TIMESTAMP, "status": "ok"})
                snap = doc_ref.get()
                return https_fn.Response(json.dumps({
                    "status": "sucesso",
                    "firestore_connected": snap.exists,
                    "document_id": snap.id
                }, default=str), mimetype="application/json")
            except Exception as fs_err:
                return https_fn.Response(json.dumps({
                    "status": "erro",
                    "detail": str(fs_err)
                }), status=500, mimetype="application/json")

        else:
            return https_fn.Response(json.dumps({
                "error": f"Rota '{path}' não encontrada.",
                "available_routes": ["/generate-story", "/generate-image", "/save-story", "/test-firestore"]
            }), status=404, mimetype="application/json")

    except Exception as e:
        import traceback
        traceback.print_exc()
        return https_fn.Response(json.dumps({
            "error": str(e),
            "detail": f"Erro interno na Cloud Function: {str(e)}"
        }), status=500, mimetype="application/json")
