import os
import io
import json
import base64
import asyncio
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from openai import AsyncOpenAI
from pydantic import BaseModel, Field
from PIL import Image

try:
    from backend.style_guide import get_llm_style_instructions, format_gpt_image_prompt, get_style_definition
except ImportError:
    from style_guide import get_llm_style_instructions, format_gpt_image_prompt, get_style_definition

# Load environment variables
load_dotenv(override=True)

# Configure OpenAI Client
api_key = os.getenv("OPENAI_API_KEY")
client = None
if api_key:
    client = AsyncOpenAI(api_key=api_key)
else:
    print("INFO: OPENAI_API_KEY not yet configured in .env.")


class StoryPage(BaseModel):
    page_number: int = Field(description="O número da página, de 1 a 10.")
    text: str = Field(
        description="Texto literário da página contendo entre 100 e 130 palavras, OBRIGATORIAMENTE EM PORTUGUÊS DO BRASIL (PT-BR). NUNCA EM INGLÊS! Estruturado em EXATAMENTE 2 parágrafos substanciais e envolventes separados por quebra dupla (\\n\\n): 1º Parágrafo de ambientação sensorial e presença dos heróis no momento presente (~50-65 palavras), e 2º Parágrafo de desenvolvimento (ação, exploração ou diálogo espontâneo com travessão se couber) fechando com um gancho intrigante para a próxima página (~50-65 palavras)."
    )
    illustration_prompt: str = Field(
        ...,
        description="Prompt de imagem super detalhado em inglês descrevendo a cena para o modelo de imagem, mantendo a anatomia exata dos personagens (animal/pet vs humano) e no estilo visual definido. REGRA ABSOLUTA: NUNCA inclua balões de fala, diálogos, textos, palavras, letras, banners ou títulos dentro da imagem. A ilustração deve ser 100% puramente visual (wordless picture book illustration)."
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
    cover_prompt: str = Field(description="Um prompt detalhado em inglês para gerar uma imagem de capa panorâmica (16:9) no estilo escolhido. REGRA ABSOLUTA: NÃO inclua títulos escritos, textos ou balões na imagem (wordless illustration, no text, no title).")
    character_appearance_bible: str = Field(
        description="Descrição física detalhada dos personagens baseada ESTRITAMENTE nas fotos enviadas (espécie: animal/pet vs humano, gênero, cabelo, óculos, porte e traços marcantes)."
    )
    clothing_bible: str = Field(
        description="Um prompt descritivo em inglês DETALHANDO as roupas e acessórios dos heróis condizentes com sua anatomia (vestimentas para humanos ou arreios/peitorais/coleiras/capas se for animal/pet)."
    )
    pages: List[StoryPage] = Field(
        description="Uma lista de exatamente 10 páginas sequenciais que formam a história."
    )


async def generate_story_with_openai(
    nome: str,
    estilo: str,
    universo: str,
    genero: str,
    images: List[Dict[str, Any]],
    descricao: str = None,
    character_details: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Gera uma história estruturada de 10 páginas usando GPT-4o-mini (econômico, preciso e rápido).
    Recebe e inspeciona visualmente as fotos de referência para identificar fielmente a espécie (Pet vs Humano)
    e garante páginas com 120 a 180 palavras (1 a 2 parágrafos sólidos).
    """
    global client
    if not client:
        current_key = os.getenv("OPENAI_API_KEY")
        if current_key:
            client = AsyncOpenAI(api_key=current_key)
        else:
            raise ValueError("OPENAI_API_KEY não encontrada no arquivo .env. Por favor, adicione sua chave.")

    tema_descricao = f"TEMA/DESCRIÇÃO ESPECÍFICA: {descricao}" if descricao else "TEMA: Aventura empolgante e marcante."
    style_directive = get_llm_style_instructions(estilo, universo)

    detalhes_personagens_str = ""
    if character_details:
        detalhes_personagens_str = "\n    DETALHES DOS PERSONAGENS:\n"
        for char in character_details:
            nome_original = char.get("original_name", "")
            apelido = char.get("nickname_in_story")
            papel = char.get("role")
            personalidade = char.get("personality")
            char_type = char.get("character_type")
            species = char.get("species_breed")
            nome_exibir = apelido if apelido else nome_original
            detalhes_personagens_str += f"    - Nome na história: {nome_exibir}"
            if char_type:
                detalhes_personagens_str += f" | Tipo: {char_type}"
            if species:
                detalhes_personagens_str += f" | Espécie/Raça: {species}"
            if papel:
                detalhes_personagens_str += f" | Papel: {papel}"
            if personalidade:
                detalhes_personagens_str += f" | Personalidade: {personalidade}"
            detalhes_personagens_str += "\n"

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
- {tema_descricao}{detalhes_personagens_str}

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

Para garantir que o livro seja visualmente espetacular, dinâmico e com rica variedade de enquadramentos, aplique as 5 LEIS DA DIREÇÃO DE FOTOGRAFIA:

1. A HISTÓRIA DITA A POSE (AÇÃO VIVA E EXPRESSIVA):
   - A pose e a postura dos protagonistas ({nome}) em cada ilustração devem capturar o ápice dramático, divertido ou curioso do que está acontecendo no texto daquela página (ex: se estão correndo de uma tempestade, mostre correria veloz; se descobriram um segredo, mostre admiração e curiosidade; se estão comemorando, mostre pulos de alegria; se estão voando, remando ou criando algo, mostre essa atividade física em ação!).
   - PROTAGONISTAS EM AÇÃO: Os heróis estão sempre engajados em ações vivas e expressivas que refletem sua jornada.

2. RITMO E VARIAÇÃO DE POSTURAS (ANTI-MONOTONIA):
   - Alterne posturas corporais entre páginas consecutivas: varie entre movimento dinâmico, caminhada, exploração, salto, contemplação em pé ou planos detalhados.
   - Poses baixas (agachado/no chão) só ocorrem quando a cena exigir expressamente uma ação rente ao solo (como buscar algo na relva).

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
   - ALTERNÂNCIA DE QUADRANTES: Alterne a composição e o ponto focal dos heróis a cada página: centro, terço direito, terço esquerdo, primeiro plano ou silhuetados à distância.
   - EVOLUÇÃO VISUAL DOS FUNDOS: O ambiente deve progredir organicamente com a jornada narrada (mudanças de iluminação como manhã, tarde, entardecer e noite; transições entre cômodos, áreas externas, clareiras, oficinas, novos horizontes).

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
   - Cada uma das 10 páginas DEVE ter rigorosamente entre 100 e 130 palavras no total, dividida em EXATAMENTE 2 parágrafos separados por \\n\\n (~50 a 65 palavras por parágrafo). Narrativa envolvente em tempo real ("Show, don't tell"). Diálogos livres e orgânicos (use travessão '—' apenas se enriquecer a cena).

PADRÃO ESTRUTURAL EXIGIDO DE UMA PÁGINA (EXATAMENTE 2 PARÁGRAFOS — ~115 PALAVRAS — EM PORTUGUÊS DO BRASIL):
"A luz dourada da alvorada filtrava-se por entre a névoa suave, revelando pegadas misteriosas gravadas no chão de pedra antiga. O jovem herói examinava com atenção as marcas recentes, com o olhar decidido e a respiração compassada, enquanto seu leal companheiro ao lado farejava cada centímetro da relíquia encontrada, com as orelhas em pé e as patinhas firmes na terra úmida.

— Encontramos a primeira pista da nossa jornada! — sussurrou o viajante, guardando o pergaminho seguro na algibeira. O pequeno companheiro soltou um latido abafado de entusiasmo, pronto para qualquer desafio que surgisse, enquanto uma suave brisa movia os arbustos ao longe, indicando o início de uma grande travessia." """

    user_text = (
        f"Crie agora a história de 10 páginas EM PORTUGUÊS DO BRASIL (PT-BR) para os personagens {nome} no universo {universo} com estilo visual {estilo}.\n\n"
        "ATENÇÃO MÁXIMA DE IDIOMA: O título e o texto de cada uma das 10 páginas DEVEM ser 100% em português brasileiro, jamais em inglês!\n\n"
        f"FIDELIDADE POSITIVA AOS PROTAGONISTAS [1 A 3]: O elenco principal é formado estritamente pelos heróis das fotos ({nome}). Se for uma dupla humano + pet, eles conduzem a aventura juntos em primeiro plano do início ao fim. Figurantes e habitantes do mundo podem aparecer naturalmente ao fundo quando a narrativa pedir.\n\n"
        "META CRÍTICA DE EXTENSÃO: Cada uma das 10 páginas DEVE ter OBRIGATORIAMENTE entre 100 e 130 palavras, estruturada em EXATAMENTE 2 PARÁGRAFOS envolventes e equilibrados (~50 a 65 palavras por parágrafo, separados por \\n\\n), com narrativa em tempo real ('Show, don't tell'). Estilo livre para diálogos (use travessão '—' apenas se fizer sentido para a cena). É ESTRITAMENTE PROIBIDO gerar páginas com 1 só parágrafo ou com 3 parágrafos!\n\n"
        "DIREÇÃO CINEMATOGRÁFICA & PROMPTS ULTRA-DETALHADOS (A HISTÓRIA GUIA A CENA COM DIVERSIDADE VISUAL):\n"
        f"Como Diretor de Fotografia, redija para cada página um `illustration_prompt` ultra-detalhado em inglês (~120 a 180 palavras) com tag de câmera ([Camera Shot Tag]). "
        "PROIBIÇÃO DE MONOTONIA E POSES REPETIDAS: Os heróis ({nome}) NÃO PODEM ficar na mesma posição corporal ou no mesmo canto da tela ao longo das páginas! "
        "A cena, os cenários e as poses DEVEM nascer organicamente dos acontecimentos do texto de cada página: se estiverem correndo, mostre dinamismo; se estiverem comemorando, mostre pulos de vitória; se estiverem observando, mostre caminhada ou contemplação; se for um momento de afeto ou descoberta, mostre planos fechados ou interação cúmplice. "
        "NUNCA repita a mesma postura corporal em páginas consecutivas e NUNCA deixe os personagens sempre agachados ou no mesmo canto inferior esquerdo. "
        "Alterne os ângulos de câmera (plano aberto, médio, close-up, low-angle, high-angle) e a lateralidade (esquerda, centro, direita). Para multi-personagens, SEMPRE descreva ambos juntos interagindo com naturalidade e expressividade!\n\n"
        "INSPEÇÃO VISUAL OBRIGATÓRIA DAS FOTOS EM ANEXO (FIDELIDADE RIGOROSA DE GÊNERO E ESPÉCIE):\n"
        "Examine atenta e minuciosamente as fotos fornecidas em anexo, associando cada uma ao seu personagem rotulado:\n"
        "- Se o personagem for SER HUMANO: identifique com precisão o GÊNERO REAL (homem/menino vs mulher/menina), idade, tom de pele, cor e textura do cabelo, e se usa óculos. NUNCA TROQUE O GÊNERO! Se a foto for de um homem/garoto, ele DEVE ser retratado expressamente como masculino (jovem, garoto, rapaz) na história, na bíblia de aparência e em todos os prompts visuais. Se for mulher/garota, retrate como feminino.\n"
        "- Se o personagem for PET/ANIMAL: ele DEVE ser um animal quadrúpede autêntico (como cachorro Pug), com focinho, orelhas e pelagem reais das fotos. NUNCA transforme em humano!\n"
        "- Preencha `character_appearance_bible` detalhando explicitamente esses traços reais (ex: 'Luca: jovem masculino de cabelo escuro cacheado com óculos') e garanta que cada `illustration_prompt` descreva o protagonista com seu gênero e características visuais exatas.\n\n"
        "Nas ilustrações, NUNCA coloque balões de fala, textos ou letras. Arte puramente visual!"
    )

    user_content = [{"type": "text", "text": user_text}]

    # Injetar fotos como blocos multimodais rotulados na mensagem do usuário para o GPT-4o-mini
    if images:
        for idx, img in enumerate(images):
            try:
                b64_str = base64.b64encode(img["data"]).decode("utf-8")
                mime = img.get("mime_type", "image/jpeg")
                char_label = ""
                if character_details and idx < len(character_details):
                    c = character_details[idx]
                    c_name = c.get("nickname_in_story") or c.get("original_name") or f"Personagem {idx+1}"
                    c_type = c.get("character_type", "person")
                    c_breed = c.get("species_breed")
                    type_str = f"Pet/Animal ({c_breed})" if c_type == "pet" else "Ser Humano"
                    char_label = f"Foto {idx+1}: {c_name} ({type_str})"
                elif img.get("name"):
                    char_label = f"Foto {idx+1}: {img.get('name')}"
                else:
                    char_label = f"Foto {idx+1}"

                user_content.append({"type": "text", "text": f"[{char_label}]:"})
                user_content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{mime};base64,{b64_str}",
                        "detail": "high"
                    }
                })
            except Exception as img_err:
                print(f"WARN: Falha ao codificar imagem de referência {idx} para multimodalidade: {img_err}")

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
    ]

    response = await client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=messages,
        response_format=Story,
        temperature=0.8
    )

    story_obj = response.choices[0].message.parsed
    usage = response.usage

    return {
        "story": story_obj.model_dump(),
        "raw_prompt": system_prompt,
        "usage": {
            "prompt_token_count": usage.prompt_tokens if usage else 0,
            "candidates_token_count": usage.completion_tokens if usage else 0,
            "total_token_count": usage.total_tokens if usage else 0,
        }
    }


async def sanitize_prompt_for_safety(
    prompt: str,
    person_name: str,
    universe_context: str,
    style: str
) -> str:
    """
    Sanitiza um prompt bloqueado mantendo a MÁXIMA ADRENALINA E AÇÃO CINEMATOGRÁFICA
    (explosões colossais, disparos de laser defletidos, faíscas e evasão),
    removendo cirurgicamente apenas termos anatômicos proibidos (sangue, carne, ferimentos).
    """
    global client
    try:
        completion = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert Hollywood blockbuster action prompt director. "
                        "A scene prompt was flagged by OpenAI image safety filters (likely due to words suggesting biological violence, gore, or injuries). "
                        "Rewrite the prompt in English to retain MAXIMUM CINEMATIC ACTION AND ADRENALINE (PG-13 blockbuster style like Star Wars / Marvel): "
                        "Keep massive blooming background fireballs, shockwaves, laser/plasma bolts streaking past, blades clashing with brilliant white sparks, "
                        "acrobatic evasive leaps, scuffed battle armor with soot and carbon scoring, and flying debris. "
                        "Eliminate ONLY: blood, flesh wounds, gore, corpses, dismemberment, or direct bullet-to-flesh impacts. "
                        "Ensure the character is heroically deflecting fire, dodging an explosive blast, or clashing blades. "
                        "Return ONLY the rewritten prompt string in 1 to 2 intense, visual sentences."
                    )
                },
                {"role": "user", "content": f"Flagged prompt: {prompt}"}
            ],
            temperature=0.4,
            max_tokens=220
        )
        safe_prompt = completion.choices[0].message.content.strip()
        print(f"INFO: High-octane prompt safely adapted: {safe_prompt[:90]}...")
        return safe_prompt
    except Exception as e:
        print(f"WARN: Error sanitizing prompt with LLM: {e}")
        return f"A high-octane cinematic action scene in {universe_context} with {person_name} performing an acrobatic combat roll as a massive fiery explosion detonates in the distant background, laser bolts streaking overhead, glowing embers and dust, scuffed armor with soot, intense hero expression, {style} style."


def prepare_image_buffer(img_bytes: bytes, filename: str = "ref.png") -> io.BytesIO:
    """
    Converte bytes de qualquer formato (JPEG, WebP, PNG) em um buffer PNG RGB
    em memória, compatível com o endpoint images.edit da OpenAI.
    """
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
        print(f"WARN: Falha ao normalizar imagem {filename}: {e}")
        buf = io.BytesIO(img_bytes)
        buf.name = filename
        buf.seek(0)
        return buf


async def generate_image_with_openai(
    prompt: str,
    reference_images: List[Dict[str, Any]],
    person_name: str,
    universe_context: str,
    style: str = "universe_default",
    is_cover: bool = False,
    clothing_bible: Optional[str] = None,
    character_appearance_bible: Optional[str] = None,
    character_details: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Gera uma ilustração usando GPT Image 2.5 (Flare ou Sunburst).
    Quando fotos ou âncoras de estilo são fornecidas, utiliza client.images.edit
    para garantir a fidelidade visual absoluta (Identity Lock e Style Lock).
    Caso nenhuma imagem seja enviada, faz fallback para client.images.generate.
    """
    global client
    if not client:
        current_key = os.getenv("OPENAI_API_KEY")
        if current_key:
            client = AsyncOpenAI(api_key=current_key)
        else:
            raise ValueError("OPENAI_API_KEY não encontrada no arquivo .env.")

    # Model and Quality from .env with robust defaults
    model = os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-2.5-flare")
    quality = os.getenv("OPENAI_IMAGE_QUALITY", "low")

    # Dimensões otimizadas oficiais da documentação do GPT Image 2.5
    target_size = "1536x1024" if is_cover else "1024x1536"

    # Separar fotos de personagens de referências de estilo
    char_refs = []
    style_refs = []
    if reference_images:
        for img in reference_images:
            fname = img.get("filename", "").lower()
            if "style" in fname or "anchor" in fname:
                style_refs.append(img)
            else:
                char_refs.append(img)

    # Selecionar fotos de referência de personagem e âncora de estilo (limite de 3 imagens no gpt-image-2.5)
    selected_style_refs = style_refs[:1]
    has_style_ref = len(selected_style_refs) > 0
    max_chars = 2 if has_style_ref else 3
    selected_char_refs = char_refs[:max_chars]

    # Criar buffers PNG em memória ordenados: herói primeiro, âncora de estilo por último
    image_buffers = []
    for idx, img in enumerate(selected_char_refs):
        buf = prepare_image_buffer(img["data"], filename=f"char_ref_{idx+1}.png")
        image_buffers.append(buf)

    for idx, img in enumerate(selected_style_refs):
        buf = prepare_image_buffer(img["data"], filename=f"style_anchor_{idx+1}.png")
        image_buffers.append(buf)

    char_ref_count = len(selected_char_refs)
    has_style_ref = len(selected_style_refs) > 0
    has_photo_ref = char_ref_count > 0

    # Monta o prompt canônico estruturado em seções rotuladas
    instruction = format_gpt_image_prompt(
        base_prompt=prompt,
        style_id=style,
        universe_id=universe_context,
        person_name=person_name,
        clothing_bible=clothing_bible,
        character_appearance_bible=character_appearance_bible,
        is_cover=is_cover,
        has_photo_ref=has_photo_ref,
        char_ref_count=char_ref_count,
        has_style_ref=has_style_ref,
        character_details=character_details
    )

    async def execute_generation(current_instruction: str):
        if image_buffers:
            for b in image_buffers:
                b.seek(0)
            img_arg = image_buffers if len(image_buffers) > 1 else image_buffers[0]
            print(f"INFO: Executando client.images.edit ({model}) com {len(image_buffers)} imagem(ns) de referência [Chars: {char_ref_count}, Style: {has_style_ref}]...")
            return await client.images.edit(
                model=model,
                image=img_arg,
                prompt=current_instruction,
                size=target_size,
                quality=quality,
                n=1
            )
        else:
            print(f"INFO: Executando client.images.generate ({model}) - text-to-image...")
            return await client.images.generate(
                model=model,
                prompt=current_instruction,
                size=target_size,
                quality=quality,
                n=1
            )

    response = None
    try:
        response = await execute_generation(instruction)
    except Exception as e:
        err_str = str(e).lower()
        if "moderation_blocked" in err_str or "safety" in err_str or "policy" in err_str:
            print(f"WARN: OpenAI moderation triggered ({e}). Softening prompt and retrying without dark style anchor...")
            sanitized_prompt = await sanitize_prompt_for_safety(
                prompt=prompt,
                person_name=person_name,
                universe_context=universe_context,
                style=style
            )
            safe_instruction = format_gpt_image_prompt(
                base_prompt=sanitized_prompt,
                style_id=style,
                universe_id=universe_context,
                person_name=person_name,
                clothing_bible=clothing_bible,
                character_appearance_bible=character_appearance_bible,
                is_cover=is_cover,
                has_photo_ref=char_ref_count > 0,
                char_ref_count=char_ref_count,
                has_style_ref=False,  # Remove âncora escura que pode acionar o filtro de saída
                character_details=character_details
            )
            try:
                # Tentativa 2: com fotos do herói apenas
                if selected_char_refs:
                    char_only_buffers = [prepare_image_buffer(c["data"], f"char_{i}.png") for i, c in enumerate(selected_char_refs)]
                    img_arg = char_only_buffers if len(char_only_buffers) > 1 else char_only_buffers[0]
                    response = await client.images.edit(
                        model=model,
                        image=img_arg,
                        prompt=safe_instruction,
                        size=target_size,
                        quality=quality,
                        n=1
                    )
                else:
                    response = await client.images.generate(
                        model=model,
                        prompt=safe_instruction,
                        size=target_size,
                        quality=quality,
                        n=1
                    )
            except Exception as mod_err2:
                print(f"WARN: Second moderation trigger ({mod_err2}). Final fallback to text-to-image...")
                wholesome_inst = format_gpt_image_prompt(
                    base_prompt=f"An inspiring epic adventure portrait of {person_name} in {universe_context}, vibrant and colorful in {style} style.",
                    style_id=style,
                    universe_id=universe_context,
                    person_name=person_name,
                    clothing_bible=clothing_bible,
                    character_appearance_bible=character_appearance_bible,
                    is_cover=is_cover,
                    has_photo_ref=False,
                    character_details=character_details
                )
                response = await client.images.generate(
                    model=model,
                    prompt=wholesome_inst,
                    size=target_size,
                    quality=quality,
                    n=1
                )
        else:
            print(f"Erro na geração de imagem com OpenAI ({model}): {e}")
            raise e

    try:
        image_bytes = None
        if hasattr(response, 'data') and response.data and len(response.data) > 0:
            first = response.data[0]
            if hasattr(first, 'b64_json') and first.b64_json:
                image_bytes = base64.b64decode(first.b64_json)
            elif hasattr(first, 'url') and first.url:
                import requests
                img_res = requests.get(first.url, timeout=20)
                if img_res.status_code == 200:
                    image_bytes = img_res.content

        if not image_bytes:
            raise ValueError("Não foi possível recuperar os bytes da imagem gerada pela OpenAI.")

        # Custo estimado baseado na tabela oficial (~$0.005 para Flare low)
        estimated_cost = 0.005 if "flare" in model.lower() and quality == "low" else 0.02

        return {
            "image_data": image_bytes,
            "effective_prompt": instruction,
            "usage_metadata": {
                "model": model,
                "quality": quality,
                "size": target_size,
                "estimated_cost_usd": estimated_cost
            }
        }

    except Exception as e:
        print(f"Erro no processamento da imagem gerada ({model}): {e}")
        raise e

