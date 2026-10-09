---
description: Diretrizes obrigatórias de engenharia de prompt para os modelos GPT Image 2.5 (Flare e Sunburst) no Imaginaria.
globs: "**/*"
---

# GPT Image 2.5 Prompting & Style Invariants

Sempre que gerar, atualizar ou validar prompts para os modelos GPT Image 2.5 Flare (`gpt-image-2.5-flare`) e Sunburst (`gpt-image-2.5-sunburst`), siga rigorosamente os seguintes princípios:

## 1. Estrutura Canônica do Prompt (Seções Rotuladas)
Para garantir máxima fidelidade artística e evitar contaminação entre contexto narrativo e renderizador, formate o prompt final em seções claras:
- `[Visual Medium & Style]`: Define o meio artístico puro (ex: "16-bit retro arcade pixel art", "handmade polymer clay stop-motion", "traditional watercolor on cold-press paper").
- `[Scene & Environment]`: Descrição do ambiente e perspectiva espacial sem linguagem contraditória.
- `[Subject & Action]`: Protagonistas, poses ativas e interações físicas.
- `[Attire & Consistency]`: Vestimentas exatas vindas da clothing_bible.
- `[Lighting & Palette]`: Iluminação e cores condizentes exclusivamente com a mídia escolhida.
- `[Negative Constraints]`: Lista explícita de exclusões para blindar o estilo.

## 2. Isolamento de Estilos Estilizados vs. Fotorrealistas
- **NUNCA** inclua termos de fotografia física (`35mm lens`, `DSLR`, `photorealistic`, `cinematic lighting`, `bokeh`, `depth of field`) em estilos não-fotográficos (como Pixel Art, Cartoon, Aquarela, Comic, Massinha/Claymation).
- Em estilos estilizados, exija **Negative Constraints** estritas:
  - Exemplo Pixel Art: `"Strictly NO photograph, NO 3D CGI, NO realistic human skin, NO smooth anti-aliased gradients, NO camera blur. Pure 2D 16-bit pixel raster grid."`

## 3. Atribuição de Papéis a Imagens de Referência
Ao enviar imagens para a API da OpenAI ou como referências multimodais:
- Declare explicitamente a função de cada imagem de entrada:
  - **Referência 1 (Identidade)**: "Preserve facial likeness, hair color and facial proportions, but re-render completely into the target [Visual Medium]."
  - **Referência 2 (Estilo/Âncora)**: "Match the visual medium, rendering technique, color palette and texture of Reference 2."

## 4. Parâmetros de API do GPT Image 2.5
- **Tamanhos Homologados**:
  - Capas: `1536x1024` (paisagem horizontal wide otimizada).
  - Páginas do livro: `1024x1536` (retrato vertical ideal para leitura infantil).
  - Quadrado: `1024x1024`.
- **Qualidade**:
  - `low`: Modo padrão de alta eficiência e baixo custo (~$0.005 por imagem).
  - `medium` / `high`: Utilizado quando há detalhes densos ou textos literais obrigatórios.
- **Texto Exato**:
  - Todo texto renderizado na imagem deve estar entre aspas ("Texto") com posição e tipografia especificadas, e instrução "No extra text".
