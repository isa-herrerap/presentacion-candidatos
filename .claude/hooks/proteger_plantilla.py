#!/usr/bin/env python3
"""Hook PreToolUse: pide confirmación antes de editar la plantilla maestra.

`deck-template/` es la plantilla de la que se copian todos los decks: un
cambio accidental ahí se propaga a cada deck futuro y desincroniza los ya
generados. El flujo normal NUNCA la toca (los decks se generan escribiendo
`decks/<slug>/data/proceso.js`), así que cualquier edición dentro de
deck-template/ se frena con una pregunta al usuario en vez de pasar directo.
"""
import json
import sys

try:
    payload = json.load(sys.stdin)
except Exception:
    sys.exit(0)

path = (payload.get("tool_input") or {}).get("file_path") or ""
if "/deck-template/" in path or path.startswith("deck-template/"):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "ask",
            "permissionDecisionReason": (
                "Estás por editar deck-template/ (la plantilla maestra). "
                "Para generar o corregir un deck se edita decks/<slug>/data/proceso.js, "
                "no la plantilla. ¿Seguro que quieres modificar la plantilla?"
            ),
        }
    }))
sys.exit(0)
