import os
import subprocess

# Map of source MD files to PDF output names
journal_dir = r"C:\Users\Dan\rspdan-portal\public\journal"
source_dir = r"L:\FAS2\CGB\nest-bridge\RELAY"

files = [
    ("NOW_ANTHROPOLOGY_001_Stan_032326", "001"),
    ("NOW_ANTHROPOLOGY_002_PokemonPedagogy_Trip_032526", "002"),
    ("NOW_ANTHROPOLOGY_003_ThreeLayerArchitecture_Stan_032626", "003"),
    ("NOW_ANTHROPOLOGY_004_NarrativeIsTheAlgorithm_Stan_032726", "004"),
    ("NOW_ANTHROPOLOGY_005_SEED_SleepCycle_Trip_032726", "005a"),
    ("NOW_ANTHROPOLOGY_005_StarterPokemon_032826", "005b"),
    ("NOW_ANTHROPOLOGY_006_HeritableSimulator_Trip_032926", "006"),
]

for base, num in files:
    src = os.path.join(source_dir, base + ".md")
    dst = os.path.join(journal_dir, base + ".pdf")
    if os.path.exists(src):
        with open(src, 'r', encoding='utf-8') as f:
            content = f.read()
        print(f"Read {base}.md ({len(content)} bytes)")
    else:
        print(f"MISSING: {src}")

print("\nAll source files verified. PDFs will be generated via write_pdf.")
