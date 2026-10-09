"""
style_guide.py - Motor Central de Estilos e Engenharia de Prompt para GPT Image 2.5 e GPT-4o-mini.
Mapeia todos os estilos e universos do Imaginaria com regras estritas de meio visual,
enquadramento, paleta e restrições negativas para blindar a integridade artística.
"""

from typing import Dict, Any, Optional

STYLE_CATALOG: Dict[str, Dict[str, Any]] = {
    "pixel_art": {
        "name": "Pixel Art",
        "visual_medium": "Authentic 16-bit retro arcade pixel art, handcrafted raster sprite artwork, visible clean pixel grid.",
        "rendering_technique": "Stepped flat color shading, vibrant 16/32-color retro palette, crisp pixel edges, absolutely no anti-aliasing or blur.",
        "framing_cues": "2D side-scrolling platformer view, retro arcade scene framing, or 3/4 isometric RPG perspective.",
        "lighting_palette": "Crisp stepped lighting, high-contrast pixel highlights, limited nostalgic gaming palette.",
        "negative_constraints": "Strictly NO photograph, NO 3D rendering, NO photorealistic human skin texture, NO realistic lighting, NO camera lens blur, NO smooth airbrush gradients, NO modern CGI.",
        "is_photographic": False
    },
    "ghibli": {
        "name": "Studio Ghibli",
        "visual_medium": "Studio Ghibli style hand-drawn 2D anime illustration, traditional cel animation aesthetic.",
        "rendering_technique": "Rich hand-painted watercolor-gouache scenic backgrounds, soft warm natural sunlight, organic lush greenery, charming expressive character linework.",
        "framing_cues": "Cinematic anime wide composition, painterly atmosphere, emotional environmental storytelling.",
        "lighting_palette": "Soft golden hour daylight, dappled forest light, serene pastel and rich earthy tones.",
        "negative_constraints": "Strictly NO 3D rendering, NO photorealistic live-action photography, NO harsh digital CGI, NO plastic gloss.",
        "is_photographic": False
    },
    "claymation": {
        "name": "Massinha (Claymation)",
        "visual_medium": "Handcrafted stop-motion clay animation, tactile polymer plasticine figures, physical miniature set.",
        "rendering_technique": "Subtle delicate fingerprint indentations on clay, matte plasticine textures, physical sculpting seams, hand-sculpted tactile world.",
        "framing_cues": "Macro tabletop stop-motion set perspective with physical studio miniature key lighting.",
        "lighting_palette": "Warm physical studio lamps, soft tabletop cast shadows, rich tactile clay colors.",
        "negative_constraints": "Strictly NO 2D flat drawing, NO digital vector art, NO photorealistic human skin, NO CGI sheen.",
        "is_photographic": False
    },
    "watercolor": {
        "name": "Aquarela",
        "visual_medium": "Traditional hand-painted watercolor on textured cold-press cotton paper.",
        "rendering_technique": "Soft translucent pigment washes, delicate wet-on-wet paint bleeds, visible natural paper grain, fine subtle ink outlines, gentle organic color gradients.",
        "framing_cues": "Whimsical children's storybook illustration composition with airy negative space.",
        "lighting_palette": "Luminous paper luminosity, gentle diffused natural light, soft pastel pigments.",
        "negative_constraints": "Strictly NO 3D CGI, NO sharp photorealistic camera render, NO plastic textures, NO glossy digital rendering.",
        "is_photographic": False
    },
    "comic": {
        "name": "Comic Book",
        "visual_medium": "Classic American comic book illustration, vintage graphic novel art.",
        "rendering_technique": "Bold dynamic black ink contour lines, visible Ben-Day halftone dot patterns, dramatic crosshatching, vibrant saturated flat four-color print palette.",
        "framing_cues": "Dramatic comic panel framing, dynamic action angles, heroic visual staging.",
        "lighting_palette": "High-contrast comic shading, bold stark black ink shadows, pop color highlights.",
        "negative_constraints": "Strictly NO photograph, NO smooth 3D CGI, NO realistic skin texture, NO muted photorealism, Strictly NO speech bubbles, NO dialogue balloons, NO text, NO words, NO letters, NO sound effects typography (NO 'POW', 'BAM'), NO titles, NO signs.",
        "is_photographic": False
    },
    "pixar": {
        "name": "Pixar 3D",
        "visual_medium": "Modern high-end 3D animated feature film style (Pixar and modern Disney 3D animation).",
        "rendering_technique": "Appealing stylized character proportions, soft subsurface scattering on stylized skin, expressive large eyes, velvety textures, warm cinematic studio animation lighting.",
        "framing_cues": "Animated feature film camera framing, whimsical cinematic depth, expressive character staging.",
        "lighting_palette": "Rich cinematic lighting with warm rim lights, magical bounce lighting, rich color volume.",
        "negative_constraints": "Strictly NO live-action photograph, NO 2D flat paper art, NO photorealistic live human pores.",
        "is_photographic": False
    },
    "disney_2d": {
        "name": "Disney Clássico 2D",
        "visual_medium": "Golden age Disney 2D hand-drawn animation, classic 1990s animated movie cel art.",
        "rendering_technique": "Smooth expressive ink lines, clean flat paint fills, lush traditionally painted gouache backgrounds, magical storybook lighting.",
        "framing_cues": "Classic animated musical film composition, theatrical staging and sweeping storybook vistas.",
        "lighting_palette": "Enchanted fairy-tale illumination, rich royal purples, golds, and emerald greens.",
        "negative_constraints": "Strictly NO 3D CGI, NO live-action photograph, NO modern digital vector clip-art.",
        "is_photographic": False
    },
    "realistic": {
        "name": "Fotorealista",
        "visual_medium": "Photorealistic candid photograph, genuine film photography.",
        "rendering_technique": "Natural skin texture with authentic pores and fine details, realistic fabric weaves, believable organic lighting, true-to-life environmental reflection.",
        "framing_cues": "Shot on 35mm film camera, natural eye-level framing, shallow depth of field, authentic subtle bokeh.",
        "lighting_palette": "Natural cinematic daylight or environmental practical lights, authentic color grading.",
        "negative_constraints": "Strictly NO cartoon, NO anime, NO 3D CGI, NO painting or illustration artifacts, NO airbrushed doll look.",
        "is_photographic": True
    },
    "noir_cartoon": {
        "name": "Cartoon Noir",
        "visual_medium": "Classic black-and-white noir cartoon animation, vintage 1940s animated detective style.",
        "rendering_technique": "High-contrast monochrome chiaroscuro lighting, deep dramatic black ink shadows, soft misty venetian blind light beams, stark monochrome palette.",
        "framing_cues": "Low-angle dramatic Dutch tilt, moody cinematic shadows, mysterious alley framing.",
        "lighting_palette": "Strictly black, white, and smoky charcoal greys with dramatic silhouetted lighting.",
        "negative_constraints": "Strictly NO color, NO modern bright CGI, NO realistic photograph, NO cheerful pastels.",
        "is_photographic": False
    },
    "cyber_art": {
        "name": "Neon Digital",
        "visual_medium": "Futuristic vibrant neon digital concept art, glowing synthwave aesthetic.",
        "rendering_technique": "Radiant electric cyan, magenta, and purple neon illumination, glowing edge highlights, reflective dark wet asphalt, high-tech holographic displays.",
        "framing_cues": "Cinematic wide-angle futuristic city framing, dynamic high-tech perspective.",
        "lighting_palette": "Deep dark backgrounds illuminated by vivid bioluminescent and neon lighting.",
        "negative_constraints": "Strictly NO rustic medieval textures, NO flat pastel watercolor, NO vintage paper.",
        "is_photographic": False
    },
    "oil_painting": {
        "name": "Pintura a Óleo",
        "visual_medium": "Traditional oil painting on coarse stretched canvas, classical fine art style.",
        "rendering_technique": "Heavy impasto texture, visible expressive brushstrokes, rich layered oil pigments, luminous Rembrandt-style lighting with deep atmospheric shadows.",
        "framing_cues": "Classical renaissance masterwork museum framing, majestic historical composition.",
        "lighting_palette": "Warm golden chiaroscuro, rich umber and cadmium pigments, varnished glaze glow.",
        "negative_constraints": "Strictly NO modern digital CGI, NO flat vector, NO live-action photograph, NO modern plastic sheen.",
        "is_photographic": False
    },
    "sketch_pencil": {
        "name": "Esboço a Lápis",
        "visual_medium": "Hand-drawn graphite pencil sketch on textured sketchpad paper.",
        "rendering_technique": "Visible pencil strokes, crosshatched shading, smudged graphite tonal gradients, delicate lead outlines, artistic paper grain.",
        "framing_cues": "Artist sketchbook page composition, expressive hand-drawn observational framing.",
        "lighting_palette": "Monochromatic graphite tones ranging from crisp 2B line work to soft 6B smudged shadows.",
        "negative_constraints": "Strictly NO color, NO digital CGI, NO photograph, NO painted fills.",
        "is_photographic": False
    },
    "low_poly": {
        "name": "Low Poly 3D",
        "visual_medium": "Geometric low-poly 3D art, modern indie game polygonal aesthetic.",
        "rendering_technique": "Visible flat faceted polygon surfaces, clean geometric edges, vibrant gradient lighting, stylized isometric or diorama feel.",
        "framing_cues": "Charming isometric diorama view or third-person game perspective.",
        "lighting_palette": "Crisp geometric shadows, clean gradient washes across faceted planes.",
        "negative_constraints": "Strictly NO smooth curved surfaces, NO photorealistic textures, NO realistic skin, NO organic realism.",
        "is_photographic": False
    },
    "pop_art": {
        "name": "Pop Art",
        "visual_medium": "Retro 1960s Pop Art screen print, Andy Warhol and Roy Lichtenstein aesthetic.",
        "rendering_technique": "High-contrast silkscreen print textures, bold saturated primary colors, visible halftone dots, graphic stencil outlines.",
        "framing_cues": "Bold poster-style graphic layout, striking high-energy pop framing.",
        "lighting_palette": "Intense unshaded primary colors (bright yellow, hot red, cobalt blue, cyan).",
        "negative_constraints": "Strictly NO subtle realism, NO 3D CGI, NO soft watercolor, NO dark muddy colors.",
        "is_photographic": False
    },
    "cyberpunk_glitch": {
        "name": "Glitch Art",
        "visual_medium": "Digital glitch art and cyberpunk data-moshing aesthetic.",
        "rendering_technique": "Cathode-ray scanlines, chromatic aberration, broken RGB pixel shifts, digital noise, holographic distortions.",
        "framing_cues": "Futuristic terminal or surveillance monitor view with distorted perspective.",
        "lighting_palette": "Electric neon phosphors, stark black terminal shadows, fractured color spikes.",
        "negative_constraints": "Strictly NO clean traditional fine art, NO pastoral photography, NO smooth clean renders.",
        "is_photographic": False
    },
    "paper_cutout": {
        "name": "Papel Recortado",
        "visual_medium": "Handmade layered paper cutout craft, tactile paper shadowbox art.",
        "rendering_technique": "Multi-layered colored craft paper, crisp cut scissor edges, gentle cast shadows between paper tiers, physical tactile construction.",
        "framing_cues": "Shadowbox framed diorama composition with layered depth.",
        "lighting_palette": "Soft directional light creating delicate physical shadows between paper layers.",
        "negative_constraints": "Strictly NO 3D CGI rendering, NO photorealistic humans, NO smooth digital airbrush.",
        "is_photographic": False
    },
    "minecraft_voxel": {
        "name": "Voxel (Blocos)",
        "visual_medium": "Voxel cube art, 3D cubic block world aesthetic (Minecraft and voxel game style).",
        "rendering_technique": "Everything composed of perfect 3D textured cubes and blocks, pixelated cubic surfaces, charming blocky characters and blocky terrain.",
        "framing_cues": "Blocky voxel video game perspective, square cubic environment.",
        "lighting_palette": "Block-based geometric lighting, square shadows, colorful voxel sunlight.",
        "negative_constraints": "Strictly NO curved smooth geometries, NO photorealistic realistic humans, NO organic rounded shapes.",
        "is_photographic": False
    },
    "simpsons_style": {
        "name": "Os Simpsons",
        "visual_medium": "Matt Groening animated cartoon style, classic The Simpsons 2D animation.",
        "rendering_technique": "Iconic bright yellow skin tone, large expressive circular round eyes with small black pupil dots, distinct overbite mouth linework, clean flat cartoon colors, solid black outlines.",
        "framing_cues": "Classic animated sitcom scene framing, humorous and dynamic cartoon staging.",
        "lighting_palette": "Bright flat daytime animation lighting, bold primary colors.",
        "negative_constraints": "Strictly NO realistic human skin, NO 3D rendering, NO photorealism, NO soft shadows.",
        "is_photographic": False
    },
    "naruto_style": {
        "name": "Estilo Naruto",
        "visual_medium": "Dynamic Japanese shonen anime style, Studio Pierrot action anime look.",
        "rendering_technique": "Sharp energetic anime linework, dramatic speedlines, cel-shaded lighting, intense expressive anime eyes, vibrant ninja action color palette.",
        "framing_cues": "High-octane action anime camera angle, heroic low angle or dynamic mid-jump pose.",
        "lighting_palette": "Dramatic anime key lighting, chakra glowing accents, high-energy highlights.",
        "negative_constraints": "Strictly NO Western photorealism, NO 3D CGI, NO live-action film look.",
        "is_photographic": False
    },
    "dragonball_style": {
        "name": "Dragon Ball Z",
        "visual_medium": "Akira Toriyama 1990s anime style, classic Dragon Ball Z 2D cel animation.",
        "rendering_technique": "Bold muscular anatomy, sharp triangular eye design, dynamic angular linework, intense aura glow and stark dramatic shadow blocks.",
        "framing_cues": "Epic shonen battlefield perspective, powerful wide-stance framing.",
        "lighting_palette": "Stark high-contrast cel shadows, blazing energy aura glows in golden, blue, and red.",
        "negative_constraints": "Strictly NO realistic photograph, NO rounded Western 3D, NO soft watercolor.",
        "is_photographic": False
    },
    "southpark_style": {
        "name": "South Park",
        "visual_medium": "Crude construction paper cutout animation, iconic South Park comedy aesthetic.",
        "rendering_technique": "Simple geometric cut-paper shapes, round paper heads, simple mitten hands, visible paper seams, choppy charming stop-motion cutout feel.",
        "framing_cues": "Flat 2D front-facing cartoon framing, simple stage staging.",
        "lighting_palette": "Completely flat unshaded paper colors, matte construction paper tones.",
        "negative_constraints": "Strictly NO high-res realistic anatomy, NO 3D rendering, NO photorealism, NO complex gradients.",
        "is_photographic": False
    },
    "rickmorty_style": {
        "name": "Rick & Morty",
        "visual_medium": "Adult sci-fi cartoon illustration, modern animated cosmic comedy style (Rick and Morty aesthetic).",
        "rendering_technique": "Loose quirky character lines, expressive pupil dots, vibrant sci-fi alien color palette with acid greens and neon pinks, comedic sci-fi props.",
        "framing_cues": "Chaotic interdimensional scene framing, bizarre alien planet vistas.",
        "lighting_palette": "Bright flat cartoon lighting with glowing portal green and cosmic neon accents.",
        "negative_constraints": "Strictly NO realistic photograph, NO high-poly 3D CGI, NO classical painting.",
        "is_photographic": False
    },
    "spiderverse_style": {
        "name": "Aranhaverso",
        "visual_medium": "Sony Spider-Verse mixed-media animation, revolutionary 3D and comic illustration hybrid.",
        "rendering_technique": "Stylized 3D geometry rendered on 2s with hand-drawn comic ink lines, chromatic aberration on focal edges, halftone Ben-Day dots, street art graffiti spray textures, neon pop colors.",
        "framing_cues": "Dizzying dynamic acrobatic urban camera angle, extreme perspective foreshortening.",
        "lighting_palette": "Vibrant cinematic neon lighting, deep comic blacks with neon rim glow.",
        "negative_constraints": "Strictly NO standard sterile CGI, NO live-action photograph, NO flat monochrome.",
        "is_photographic": False
    },
    "universe_default": {
        "name": "Estilo do Universo",
        "visual_medium": "Authentic canonical visual aesthetic matching the chosen universe lore.",
        "rendering_technique": "Faithful to the original media format of the universe.",
        "framing_cues": "Classic universe-appropriate staging.",
        "lighting_palette": "Thematic atmospheric lighting.",
        "negative_constraints": "Strictly NO mismatched art styles, NO out-of-universe elements.",
        "is_photographic": False
    }
}

UNIVERSE_CATALOG: Dict[str, Dict[str, str]] = {
    "fantasy_medieval": {"name": "Medieval Fantasia", "context": "high fantasy realm, magical kingdom lore, enchanted landscapes"},
    "star_wars": {"name": "Star Wars", "context": "space opera galaxy, galactic starfleet lore, planetary vistas"},
    "harry_potter": {"name": "Harry Potter", "context": "magical wizarding realm, enchanted stone halls, mystical creature lore"},
    "marvel": {"name": "Marvel", "context": "superhero comic metropolis, high-tech heroic action, dynamic cityscape"},
    "dc": {"name": "DC Comics", "context": "gothic urban skyline, heroic justice legends, dramatic atmosphere"},
    "disney_princess": {"name": "Disney Princesas", "context": "fairytale royal kingdom, enchanted flora, pastoral storybook beauty"},
    "simpsons": {"name": "Os Simpsons", "context": "Springfield animated town lore, colorful cartoon neighborhoods"},
    "cyberpunk": {"name": "Cyberpunk", "context": "dystopian megacity, towering neon facades, rainy street level"},
    "lord_rings": {"name": "Senhor dos Anéis", "context": "Middle-earth high fantasy, ancient wilderness, epic terrain"},
    "pokemon": {"name": "Pokémon", "context": "vibrant creature training adventure, natural routes, anime world"},
    "pirates": {"name": "Piratas", "context": "golden age of piracy, uncharted ocean isles, tall ship lore"},
    "western": {"name": "Western", "context": "frontier wild west, canyon trails, wooden dusty outposts"},
    "noir": {"name": "Noir", "context": "1940s moody metropolis, rain-slicked pavement, atmospheric shadows"},
    "steampunk": {"name": "Steampunk", "context": "Victorian neo-industrial era, brass and copper clockwork machinery"},
    "naruto": {"name": "Naruto", "context": "ninja hidden village lore, training grounds, elemental chakra world"},
    "dragon_ball": {"name": "Dragon Ball", "context": "martial arts sci-fi fantasy, desert canyons, capsule technology"},
    "one_piece": {"name": "One Piece", "context": "grand pirate ocean adventure, bizarre islands, high seas"},
    "titan": {"name": "Attack on Titan", "context": "walled historic Germanic city, colossal stone ramparts"},
    "saint_seiya": {"name": "Cavaleiros do Zodíaco", "context": "mythological sanctuary, sacred marble temples, starry cosmos"},
    "mario": {"name": "Super Mario", "context": "Mushroom Kingdom, green warp pipes, colorful playful terrain"},
    "zelda": {"name": "Zelda", "context": "kingdom of Hyrule, ancient ruins, sprawling wilderness meadows"},
    "minecraft": {"name": "Minecraft", "context": "cubic block voxel sandbox, geometric blocky terrain"},
    "arcane": {"name": "Arcane (LoL)", "context": "twin cities of Piltover and Zaun, hextech and chemtech aesthetics"},
    "sonic": {"name": "Sonic", "context": "checkered loop-de-loop rolling hills, high-speed vibrant terrain"},
    "football": {"name": "Futebol", "context": "grand illuminated football arena, pristine grass pitch"},
    "volleyball": {"name": "Vôlei", "context": "sunny sand beach volleyball court, azure ocean horizon"},
    "basketball": {"name": "Basquete", "context": "urban hardwood basketball court, gleaming floodlights"},
    "f1": {"name": "Fórmula 1", "context": "high-speed asphalt racing circuit, pitlane grandstands"},
    "stranger_things": {"name": "Stranger Things", "context": "nostalgic 1980s small Indiana town, dark woods, eerie glow"},
    "barbie": {"name": "Barbie", "context": "sparkling dreamhouse aesthetic, pastel paradise"},
    "got": {"name": "Game of Thrones", "context": "gritty medieval Westeros, frosty keeps, northern wilderness"},
    "jurassic": {"name": "Jurassic Park", "context": "remote tropical island jungle, prehistoric flora, majestic dinosaurs"},
    "spider_verse": {"name": "Aranhaverso", "context": "multiverse metropolis, comic halftone overlays, neon billboards"},
    "the_last_of_us": {"name": "The Last of Us", "context": "overgrown post-apocalyptic city, weathered concrete and lush vines"},
    "mickey": {"name": "Mickey & Amigos", "context": "cheerful classic Disney animation world, whimsical pastoral hills"},
    "south_park": {"name": "South Park", "context": "snowy mountain Colorado town, simple cutout architecture"},
    "rick_morty": {"name": "Rick & Morty", "context": "chaotic sci-fi laboratory, interdimensional portal vistas"},
    "spongebob": {"name": "Bob Esponja", "context": "underwater Bikini Bottom, pineapple homes, sandy sea floor"},
    "scooby": {"name": "Scooby-Doo", "context": "creepy abandoned amusement park, haunted Victorian estates, foggy night"},
    "gravity_falls": {"name": "Gravity Falls", "context": "Pacific Northwest pine forest, Mystery Shack, cryptic symbols"},
    "steven_universe": {"name": "Steven Universe", "context": "pastel coastal town, crystal monuments, magical dunes"},
    "phineas_ferb": {"name": "Phineas & Ferb", "context": "sunny suburban backyard, inventive contraptions, summer greenery"}
}


def get_style_definition(style_id: str) -> Dict[str, Any]:
    """Retorna os metadados de estilo para o identificador fornecido."""
    key = (style_id or "universe_default").strip().lower()
    return STYLE_CATALOG.get(key, STYLE_CATALOG["universe_default"])


def get_universe_definition(universe_id: str) -> Dict[str, str]:
    """Retorna os metadados do universo fornecido."""
    key = (universe_id or "fantasy_medieval").strip().lower()
    return UNIVERSE_CATALOG.get(key, {"name": universe_id, "context": f"the {universe_id} setting"})


def get_llm_style_instructions(style_id: str, universe_id: str) -> str:
    """
    Retorna diretrizes explícitas para o GPT-4o-mini ao escrever a história e os illustration_prompts,
    impedindo que o modelo insira termos contraditórios de câmera física em estilos artísticos não-fotográficos.
    """
    style_def = get_style_definition(style_id)
    univ_def = get_universe_definition(universe_id)
    
    style_name = style_def["name"]
    is_photo = style_def.get("is_photographic", False)
    
    if is_photo:
        return f"""VISUAL STYLE DIRECTIVE: '{style_name}' in '{univ_def['name']}'.
- Describe candid, authentic scenes with natural photographic lighting and framing (35mm aesthetic).
- Focus on real-world textures, candid natural poses, and authentic environmental lighting."""
    
    # Non-photographic styles (Pixel Art, Claymation, Watercolor, Cartoon, Anime, etc.)
    return f"""VISUAL STYLE DIRECTIVE: STRICT '{style_name}' ({style_def['visual_medium']}) in '{univ_def['name']}'.
- CRITICAL: Do NOT use physical camera terminology (e.g. '35mm lens', '50mm', 'DSLR', 'photorealistic', 'bokeh', 'shutter speed')!
- Describe the illustration using {style_name} principles: {style_def['framing_cues']}
- Ensure all illustration prompts and cover prompts demand pure '{style_name}' rendering ({style_def['rendering_technique']}).
- Never ask for a realistic photograph or 3D CGI gloss unless explicitly instructed."""


def format_gpt_image_prompt(
    base_prompt: str,
    style_id: str,
    universe_id: str,
    person_name: str,
    clothing_bible: Optional[str] = None,
    character_appearance_bible: Optional[str] = None,
    is_cover: bool = False,
    has_photo_ref: bool = False,
    char_ref_count: int = 0,
    has_style_ref: bool = False,
    character_details: Optional[list] = None
) -> str:
    """
    Monta o prompt canônico para o GPT Image 2.5 estruturado em blocos rotulados,
    referenciando explicitamente as imagens de entrada (fotos reais e âncora de estilo)
    para o endpoint images.edit, em estrita conformidade com .agents/rules/gpt_image_prompting.md.
    Distingue com precisão histórias com múltiplos personagens (ex: humano + pet) de
    histórias com um único protagonista (com 1 ou mais fotos).
    """
    style_def = get_style_definition(style_id)
    univ_def = get_universe_definition(universe_id)

    # 1. Visual Medium & Style
    medium_text = style_def["visual_medium"]
    technique_text = style_def["rendering_technique"]
    
    # 2. Composition / Framing (Dynamic Cinematography Priority)
    if is_cover:
        composition_section = "Wide panoramic cover illustration (16:9), epic central focal composition, title-worthy cinematic presentation."
    else:
        composition_section = "Vertical storybook page illustration (portrait), rich multi-layered depth."

    # Parse individual character names to detect multi-character stories
    raw_names = [n.strip() for n in person_name.replace(" and ", ",").replace(" e ", ",").split(",") if n.strip()]
    is_multi_character = len(raw_names) > 1 or (character_details and len(character_details) > 1)

    effective_char_count = char_ref_count if char_ref_count > 0 else (1 if has_photo_ref else 0)

    # 3. Subject & Action (Character Likeness & Adaptation)
    character_adaptation = f"Features character(s): {person_name}."
    if character_appearance_bible and character_appearance_bible.strip():
        character_adaptation += f" Visual appearance profile: {character_appearance_bible.strip()}."

    if is_multi_character:
        # ---- MULTI-CHARACTER STORY (e.g. Human + Pet or 2 Companions) ----
        # Extract metadata if available
        char_info_list = []
        if character_details and len(character_details) >= len(raw_names):
            char_info_list = character_details
        else:
            for name in raw_names:
                char_info_list.append({"name": name, "character_type": "unknown", "species_breed": None})

        # Describe input images individually
        ref_clauses = []
        for idx in range(min(effective_char_count, len(char_info_list))):
            c_info = char_info_list[idx]
            c_name = c_info.get("name") or c_info.get("original_name") or raw_names[min(idx, len(raw_names)-1)]
            c_type = str(c_info.get("character_type", "")).lower()
            c_breed = c_info.get("species_breed")

            is_pet = c_type == "pet" or (c_breed is not None and len(str(c_breed)) > 0)
            if not is_pet and character_appearance_bible:
                bible_lower = character_appearance_bible.lower()
                if any(w in bible_lower for w in ["pug", "dog", "cachorro", "gato", "cat", "pet", "pelagem", "focinho"]):
                    if idx == len(char_info_list) - 1: # Usually pet is secondary
                        is_pet = True

            if is_pet:
                breed_clause = f" ({c_breed})" if c_breed else " (quadruped companion)"
                ref_clauses.append(
                    f"Input image {idx + 1} is the reference photo for pet companion '{c_name}'{breed_clause}. "
                    f"PET ANATOMY FIDELITY: Faithfully preserve genuine quadruped animal anatomy, fur markings and coloration, "
                    f"ears, muzzle, expressive eyes, and natural animal posture."
                )
            else:
                ref_clauses.append(
                    f"Input image {idx + 1} is the reference photo for protagonist '{c_name}' (Human). "
                    f"HUMAN IDENTITY FIDELITY: Faithfully preserve facial likeness, bone structure, eye shape, smile, "
                    f"hair color and texture, skin tone, and authentic human proportions. "
                    f"GENDER & AGE FIDELITY: Faithfully preserve the apparent gender and age from Input image {idx + 1}. "
                    f"If the photo depicts a male, render positively as a male (young man/boy). If the photo depicts a female, render positively as a female. "
                    f"If the person wears eyeglasses in the photo, faithfully include matching eyeglasses on the character."
                )

        if ref_clauses:
            character_adaptation += " " + " ".join(ref_clauses)

        character_adaptation += (
            f" COMPANION ENSEMBLE: The characters ({person_name}) are an inseparable heroic team. "
            f"Render designated companions together in the scene actively interacting with genuine expressiveness. "
            f"Preserve each companion's authentic identity, species, and anatomy."
        )

        cast_staging_rule = (
            f"PRIMARY HERO CAST & SETTING STAGING: The primary focal heroes in the scene are strictly ({person_name}) "
            f"mapped from reference photos [1 to {effective_char_count}]. "
            f"Environmental extras, background villagers, guards, or passersby are naturally welcome in the background whenever fitting the narrative setting, "
            f"while ({person_name}) remain the distinctive, clear focal protagonists in the foreground/midground."
        )

    else:
        # ---- SINGLE PROTAGONIST STORY ----
        if effective_char_count == 1:
            ref_clause = (
                f"Input image 1 is the protagonist reference photo for {person_name}. "
                "IDENTITY FIDELITY: Accurately adapt and faithfully preserve the exact physical likeness, facial features, bone structure, skin tone, hair, "
                "or pet quadruped anatomy (fur colors/markings, muzzle shape, ears, eyes, tail if pet) from Input image 1 into the specified scene and artistic medium. "
                "GENDER & AGE FIDELITY: Faithfully preserve the apparent gender and age from Input image 1. If male, render positively as male. If female, render positively as female. "
                "If the person wears eyeglasses in the photo, faithfully include matching eyeglasses on the character."
            )
        elif effective_char_count > 1:
            ref_clause = (
                f"INPUT IMAGES 1 TO {effective_char_count} ALL DEPICT THE EXACT SAME SINGLE INDIVIDUAL (different photo angles of {person_name}). "
                f"PRIMARY INDIVIDUAL FOCUS: Render {person_name} in this scene, preserving likeness faithfully."
            )
        else:
            ref_clause = f"Faithfully adapt the character {person_name} into the target medium."

        character_adaptation += f" {ref_clause}"

        cast_staging_rule = (
            f"PRIMARY PROTAGONIST FOCUS: The primary focal protagonist in the scene is strictly {person_name}, faithfully adapted from reference photo(s). "
            f"Secondary background extras or bystanders fitting the setting may appear naturally in the environment with distinct incidental appearances, "
            f"while {person_name} remains the clear focal hero."
        )

    char_label = "characters" if is_multi_character else "character"
    if not style_def.get("is_photographic", False):
        character_adaptation += f" REDRAW AND ADAPT the {char_label} completely into the '{style_def['name']}' medium ({medium_text}). Absolutely NO photo collage, NO pasted real faces, and NEVER turn an animal/pet into a human or vice versa."

    pose_rule = (
        "CRITICAL POSE & CAMERA DYNAMICS: Faithfully render the character(s) executing the specific kinetic action, "
        "unique bodily posture, and camera distance defined in [Scene & Environment]. DO NOT default to a repetitive kneeling, "
        "crouching, or seated pose on a rock. Every scene must feature a distinct bodily posture, dynamic movement, and fresh screen composition."
    )

    subject_section = f"{character_adaptation} {pose_rule} {cast_staging_rule}"

    # 4. Attire & Consistency (Sobrescrita total de roupas civis da foto)
    if clothing_bible and clothing_bible.strip():
        attire_section = (
            f"CRITICAL ATTIRE OVERRIDE: Completely remove, discard, and ignore any modern civilian clothes (such as t-shirts, casual shirts, hoodies, sneakers) visible in reference photos. "
            f"The character(s) MUST ONLY wear the specified story attire: {clothing_bible.strip()}."
        )
    else:
        attire_section = "Attire guidelines: Canonical heroic costume consistent with the story and world. Strictly NO modern civilian clothing."

    # 5. Lighting & Palette (Harmonized with Scene Atmosphere)
    lighting_section = (
        f"{style_def['lighting_palette']} "
        f"Faithfully illuminate the scene according to the dynamic lighting, atmospheric conditions, and volumetric sources described in [Scene & Environment], while strictly honoring the color shading and texture technique of '{style_def['name']}'."
    )

    # 6. Negative Constraints (Anti-Monotony, Multi-Character Shield, and Safety)
    base_negative = style_def["negative_constraints"]
    
    character_negative = f"Strictly NO duplicate clones of {person_name}'s face, NO twin copies of the protagonist."

    negative_section = (
        f"{base_negative} Strictly NO blood, NO gory wounds, NO flesh damage, NO corpses. "
        "Strictly NO speech bubbles, NO dialogue balloons, NO text, NO words, NO letters, NO typography, NO titles, NO signs, NO banners, NO watermarks, NO comic lettering. Pure wordless visual picture-book artwork. "
        f"{character_negative} "
        "Strictly NO repetitive kneeling or crouching poses across scenes, NO repeating identical lower-left screen placement across scenes, NO monotonous static frontal posing."
    )

    # 7. Style Reference Anchor guidance (Style Lock via Input Images)
    style_anchor_guidance = ""
    if has_style_ref:
        style_anchor_idx = effective_char_count + 1 if effective_char_count > 0 else 1
        style_anchor_guidance = (
            f"[Style Anchor Adherence]: Input image {style_anchor_idx} is PROVIDED SOLELY AND EXCLUSIVELY AS A STYLE REFERENCE FOR ART MEDIUM, BRUSHWORK, LIGHTING AND COLOR PALETTE. "
            f"CRITICAL NEGATIVE DIRECTIVE: Any character, person, figure, or silhouette depicted inside Input image {style_anchor_idx} MUST BE COMPLETELY IGNORED AND DISCARDED. "
            f"DO NOT copy, transfer, reproduce, or redraw ANY character or human figure from Input image {style_anchor_idx} into this scene. "
            f"The subject of this new illustration must ONLY be drawn once based on the protagonist reference photo."
        )

    # Assembling Canonical Labeled Prompt strictly aligned with .agents/rules/gpt_image_prompting.md
    prompt_sections = [
        f"[Visual Medium & Style]: {medium_text} {technique_text}",
        f"[Scene & Environment]: {base_prompt.strip()} | {composition_section} | Setting: Authentic {univ_def['name']} atmosphere.",
        f"[Subject & Action]: {subject_section}",
        f"[Attire & Consistency]: {attire_section}",
        f"[Lighting & Palette]: {lighting_section}",
        f"[Negative Constraints]: {negative_section}"
    ]

    if style_anchor_guidance:
        prompt_sections.append(style_anchor_guidance)

    return "\n\n".join(prompt_sections)


