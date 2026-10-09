"""
test_style_prompts.py - Script de validação automatizada dos estilos e formatação canônica de prompts.
"""

from backend.style_guide import (
    STYLE_CATALOG,
    UNIVERSE_CATALOG,
    get_style_definition,
    get_universe_definition,
    get_llm_style_instructions,
    format_gpt_image_prompt
)

def run_tests():
    print("=== INICIANDO TESTES DO MOTOR DE ESTILOS (GPT Image 2.5 & GPT-4o-mini) ===")
    
    # 1. Teste de Cobertura Total de Estilos
    print(f"\n1. Testando catálogo de estilos ({len(STYLE_CATALOG)} estilos registrados)...")
    for style_id, style_data in STYLE_CATALOG.items():
        assert "visual_medium" in style_data, f"Falta visual_medium no estilo {style_id}"
        assert "rendering_technique" in style_data, f"Falta rendering_technique no estilo {style_id}"
        assert "negative_constraints" in style_data, f"Falta negative_constraints no estilo {style_id}"
        assert "is_photographic" in style_data, f"Falta is_photographic no estilo {style_id}"
    print(f"   [OK] Todos os {len(STYLE_CATALOG)} estilos possuem estrutura completa.")

    # 2. Teste do Estilo Crítico: PIXEL ART
    print("\n2. Testando isolamento e blindagem do estilo 'pixel_art'...")
    llm_instructions = get_llm_style_instructions("pixel_art", "fantasy_medieval")
    assert "Do NOT use physical camera terminology" in llm_instructions, "Instrução de câmera ausente no Pixel Art!"
    print("   [OK] LLM Style Instructions proíbe termos de câmera física para Pixel Art.")

    pixel_prompt = format_gpt_image_prompt(
        base_prompt="Lucas jumps across mossy ruins holding a magical glowing crystal",
        style_id="pixel_art",
        universe_id="fantasy_medieval",
        person_name="Lucas",
        clothing_bible="Green adventurer tunic with brown leather belt",
        is_cover=False,
        has_photo_ref=True
    )

    print("\n--- Prompt Gerado para Pixel Art ---")
    print(pixel_prompt)
    print("------------------------------------")

    assert "[Visual Medium & Style]" in pixel_prompt
    assert "16-bit retro arcade pixel art" in pixel_prompt
    assert "[Negative Constraints]" in pixel_prompt
    assert "Strictly NO photograph, NO 3D rendering" in pixel_prompt
    assert "REDRAW AND ADAPT the character completely into the 'Pixel Art' medium" in pixel_prompt
    assert "CRITICAL ATTIRE OVERRIDE" in pixel_prompt
    assert "SINGLE-INSTANCE FOCUS" in pixel_prompt
    print("   [OK] Prompt canônico de Pixel Art possui blocos rotulados, regra de adaptação, sobrescrita de figurino e anti-clonagem.")

    # 3. Teste do Estilo Fotorrealista
    print("\n3. Testando estilo 'realistic'...")
    real_prompt = format_gpt_image_prompt(
        base_prompt="Lucas walking through a bustling neon street",
        style_id="realistic",
        universe_id="cyberpunk",
        person_name="Lucas",
        clothing_bible="Dark leather trench coat",
        is_cover=True,
        has_photo_ref=True
    )
    assert "Photorealistic candid photograph" in real_prompt
    assert "Strictly NO cartoon, NO anime" in real_prompt
    assert "16:9" in real_prompt
    assert "CRITICAL ATTIRE OVERRIDE" in real_prompt
    assert "Dark leather trench coat" in real_prompt
    print("   [OK] Prompt fotorrealista configurado corretamente para capas panorâmicas (16:9) e figurino.")

    # 4. Teste de Massinha (Claymation) e Aquarela (Watercolor)
    print("\n4. Testando 'claymation' e 'watercolor'...")
    clay_prompt = format_gpt_image_prompt(
        base_prompt="A friendly dragon greets the hero",
        style_id="claymation",
        universe_id="fantasy_medieval",
        person_name="Lucas",
        is_cover=False,
        has_photo_ref=False
    )
    assert "fingerprint indentations" in clay_prompt
    assert "Strictly NO 2D flat drawing" in clay_prompt

    water_prompt = format_gpt_image_prompt(
        base_prompt="A quiet river valley at dawn",
        style_id="watercolor",
        universe_id="lord_rings",
        person_name="Lucas",
        is_cover=False,
        has_photo_ref=False
    )
    assert "cold-press cotton paper" in water_prompt
    assert "Strictly NO 3D CGI" in water_prompt
    print("   [OK] Claymation e Aquarela possuem assinaturas materiais físicas autênticas.")

    # 5. Teste de Múltiplos Personagens (Humano + Pet)
    print("\n5. Testando geração de prompts com Múltiplos Personagens (Humano + Pet)...")
    multi_prompt = format_gpt_image_prompt(
        base_prompt="Lucas looks at a treasure map while his loyal pug Luca sniffs the ground",
        style_id="pixar",
        universe_id="fantasy_medieval",
        person_name="Lucas, Luca",
        character_details=[
            {"original_name": "Lucas", "character_type": "person", "species_breed": None},
            {"original_name": "Luca", "character_type": "pet", "species_breed": "Cachorro Pug"}
        ],
        clothing_bible="Green tunic for Lucas; red neck bandana for Luca the pug",
        is_cover=False,
        has_photo_ref=True,
        char_ref_count=2
    )

    print("\n--- Prompt Gerado para Humano + Pet ---")
    print(multi_prompt)
    print("---------------------------------------")

    assert "Input image 1 is the reference photo for protagonist 'Lucas' (Human)" in multi_prompt
    assert "CRITICAL HUMAN IDENTITY LOCK" in multi_prompt
    assert "Input image 2 is the reference photo for pet companion 'Luca' (Cachorro Pug)" in multi_prompt
    assert "CRITICAL PET ANATOMY LOCK" in multi_prompt
    assert "MANDATORY INSEPARABLE DUO / ENSEMBLE MANDATE" in multi_prompt
    assert "STRICT CAST FIDELITY" in multi_prompt
    assert "Strictly NO extra unrequested random people" in multi_prompt
    print("   [OK] Prompt multi-personagens protege a anatomia do pet, identidade do humano e proíbe intrusos aleatórios!")

    print("\n=== TODOS OS TESTES PASSARAM COM SUCESSO! ===")

if __name__ == "__main__":
    run_tests()
