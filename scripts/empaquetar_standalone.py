#!/usr/bin/env python3
"""Empaqueta un deck ya generado en UN SOLO archivo HTML autocontenido, para
mandarlo por correo/Slack/WhatsApp sin la carpeta completa.

Uso:
    python3 scripts/empaquetar_standalone.py <carpeta-del-deck>

Ej.:
    python3 scripts/empaquetar_standalone.py decks/brand-manager-autosummit

Deja <carpeta-del-deck>/<slug>-standalone.html: el mismo deck.html, pero con
data/proceso.js, las láminas de slides/, _nav.js, los logos y las fotos de
candidatos (si las hay) incrustados adentro en base64 — no depende de ningún
otro archivo de la carpeta. Se abre con doble clic exactamente igual que
deck.html.

Lo único que sigue viniendo de internet son las tipografías de marca (Red Hat
Display + Inter, vía Google Fonts): sin conexión el deck cae a una tipografía
del sistema — se ve, pero no con la fuente de marca.

Este script sólo LEE deck.html, data/proceso.js, slides/*.html y
assets/*.svg, y escribe el archivo nuevo al lado. No toca nada de la carpeta
del deck ni de deck-template/.
"""
import base64
import mimetypes
import os
import re
import sys

FOTO_RE = re.compile(r"""(foto\s*:\s*)(['"])((?:(?!\2).)*)\2""")


def b64_file(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("ascii")


def data_uri(path: str) -> str:
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    return f"data:{mime};base64,{b64_file(path)}"


def js_str(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def inline_fotos(proceso_js: str, deck_dir: str) -> str:
    def repl(m):
        prefijo, quote, ruta = m.group(1), m.group(2), m.group(3)
        if re.match(r"^(https?:|data:|/)", ruta):
            return m.group(0)
        abs_path = os.path.join(deck_dir, ruta)
        if not os.path.isfile(abs_path):
            print(f"  OJO: foto no encontrada, se deja la ruta tal cual: {ruta}")
            return m.group(0)
        print(f"  foto incrustada: {ruta}")
        return f"{prefijo}{quote}{data_uri(abs_path)}{quote}"

    return FOTO_RE.sub(repl, proceso_js)


def exigir(texto: str, fragmento: str, donde: str) -> None:
    if fragmento not in texto:
        sys.exit(
            f"{donde}: no encontré el texto esperado (la plantilla cambió, "
            f"hay que revisar/actualizar este script):\n  {fragmento}"
        )


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("Uso: python3 scripts/empaquetar_standalone.py <carpeta-del-deck>")
    deck_dir = os.path.abspath(sys.argv[1])
    if not os.path.isfile(os.path.join(deck_dir, "deck.html")):
        sys.exit(f"No hay deck.html en: {deck_dir}")

    with open(os.path.join(deck_dir, "data", "proceso.js"), encoding="utf-8") as f:
        proceso_js = f.read()
    proceso_js = inline_fotos(proceso_js, deck_dir)

    with open(os.path.join(deck_dir, "slides", "_nav.js"), encoding="utf-8") as f:
        nav_js = f.read()

    logo_pos = data_uri(os.path.join(deck_dir, "assets", "logo-horizontal-positivo.svg"))
    logo_neg = data_uri(os.path.join(deck_dir, "assets", "logo-horizontal-negativo.svg"))

    slides_dir = os.path.join(deck_dir, "slides")
    slide_files = sorted(f for f in os.listdir(slides_dir) if f.endswith(".html"))

    slide_b64 = {}
    for fname in slide_files:
        with open(os.path.join(slides_dir, fname), encoding="utf-8") as f:
            text = f.read()
        # Una URL data: en base64 no admite '?query' al final (se mezclaría con
        # los datos y rompería la decodificación) — el único trozo que el
        # navegador separa ANTES de decodificar es el fragmento '#'. Por eso el
        # shell empaqueta tema/candidato/paso ahí, y cada lámina tiene que leerlos
        # de location.hash en vez de location.search para que le lleguen igual.
        exigir(text, "location.search", fname)
        text = text.replace("location.search", "location.hash.slice(1)")
        exigir(text, '<script src="_nav.js"></script>', fname)
        text = text.replace('<script src="_nav.js"></script>', "<script>\n" + nav_js + "\n</script>")
        exigir(text, '<script src="../data/proceso.js"></script>', fname)
        text = text.replace('<script src="../data/proceso.js"></script>', "<script>\n" + proceso_js + "\n</script>")
        text = text.replace('src="../assets/logo-horizontal-positivo.svg"', f'src="{logo_pos}"')
        text = text.replace('src="../assets/logo-horizontal-negativo.svg"', f'src="{logo_neg}"')
        slide_b64[fname] = base64.b64encode(text.encode("utf-8")).decode("ascii")

    with open(os.path.join(deck_dir, "deck.html"), encoding="utf-8") as f:
        shell = f.read()

    marca_cargar = "cargar('slides/'+s.file+'?b='+BUILD+'&theme='+theme+(s.params ? '&'+s.params : '')+(atEnd ? '&at=end' : ''));"
    marca_cv = "cvFrame.src = 'slides/cv.html?b='+BUILD+'&theme='+theme+'&'+s.cv;"
    for frag in ('<script src="data/proceso.js"></script>', 'src="assets/logo-horizontal-positivo.svg"',
                 'src="assets/logo-horizontal-negativo.svg"', marca_cargar, marca_cv, "const BUILD = "):
        exigir(shell, frag, "deck.html")

    shell = shell.replace('<script src="data/proceso.js"></script>', "<script>\n" + proceso_js + "\n</script>")
    shell = shell.replace('src="assets/logo-horizontal-positivo.svg"', f'src="{logo_pos}"')
    shell = shell.replace('src="assets/logo-horizontal-negativo.svg"', f'src="{logo_neg}"')

    mapa = "const SLIDE_B64 = {\n" + ",\n".join(
        f"  {js_str(fname)}: {js_str(slide_b64[fname])}" for fname in slide_files
    ) + "\n};\nfunction slideSrc(file){ return 'data:text/html;base64,' + SLIDE_B64[file]; }\n"
    shell = shell.replace("const BUILD = ", mapa + "const BUILD = ", 1)

    shell = shell.replace(marca_cargar, "cargar(slideSrc(s.file)+'#b='+BUILD+'&theme='+theme+(s.params ? '&'+s.params : '')+(atEnd ? '&at=end' : ''));")
    shell = shell.replace(marca_cv, "cvFrame.src = slideSrc('cv.html')+'#b='+BUILD+'&theme='+theme+'&'+s.cv;")

    slug = os.path.basename(deck_dir.rstrip("/"))
    out_path = os.path.join(deck_dir, f"{slug}-standalone.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(shell)

    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"\nlisto -> {out_path} ({size_mb:.1f} MB)")
    print("Un solo archivo: doble clic para abrirlo, se puede mandar tal cual por correo/Slack.")
    print("Sigue pidiendo internet sólo para las tipografías de marca (cae a una del sistema si no hay).")


if __name__ == "__main__":
    main()
