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
import io
import mimetypes
import os
import re
import sys

try:
    from PIL import Image
except ImportError:
    Image = None

FOTO_RE = re.compile(r"""(["']?foto["']?\s*:\s*)(['"])((?:(?!\2).)*)\2""")

# `foto` se pinta SÓLO en perfil.html, dentro de un círculo de ~124px máximo
# (ver deck-template/slides/perfil.html, `.foto{width:clamp(76px,12vh,124px)}`).
# Las fotos que entrega la consultora suelen ser capturas de LinkedIn de
# 1000-1500px por lado y 1-1.5 MB cada una — de ahí sale casi todo el peso de
# un standalone con fotos (con 6 candidatos, ~9 MB en base64 sólo de fotos).
# Se reescalan a esto antes de incrustarlas: de sobra para verse nítidas
# incluso en una pantalla retina, y del orden de 15-40 KB cada una en vez de
# 1+ MB. `_MAX_LADO` es el lado más largo tras el resize (no fuerza cuadrado:
# el CSS ya recorta con `object-fit:cover` + `border-radius:50%`).
_MAX_LADO_FOTO = 420
_CALIDAD_JPEG = 82


def b64_file(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("ascii")


def data_uri(path: str) -> str:
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    return f"data:{mime};base64,{b64_file(path)}"


def foto_data_uri(path: str) -> str:
    """Como data_uri(), pero para fotos de candidatos: reescala y recomprime
    a JPEG antes de incrustar. Si Pillow no está instalado, cae a incrustar
    el archivo tal cual (mismo comportamiento de antes) con un aviso."""
    if Image is None:
        print("  OJO: Pillow no está instalado — la foto se incrusta sin comprimir "
              "(pip install Pillow para bajar el peso del standalone).")
        return data_uri(path)
    try:
        img = Image.open(path)
        # `convert('RGB')` directo sobre RGBA no aplana el alfa, lo descarta
        # (deja basura donde había transparencia) — si el modo trae canal
        # alfa, aplanar explícito sobre blanco primero. Cualquier resto fuera
        # del área opaca de todos modos queda recortado por el círculo CSS.
        if img.mode in ("RGBA", "LA", "P"):
            src = img.convert("RGBA")
            base = Image.new("RGB", src.size, (255, 255, 255))
            base.paste(src, mask=src.split()[-1])
            img = base
        elif img.mode != "RGB":
            img = img.convert("RGB")
        lado = max(img.size)
        if lado > _MAX_LADO_FOTO:
            factor = _MAX_LADO_FOTO / lado
            img = img.resize((round(img.width * factor), round(img.height * factor)), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=_CALIDAD_JPEG, optimize=True)
        return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")
    except Exception as e:
        print(f"  OJO: no se pudo recomprimir {path} ({e}) — se incrusta tal cual.")
        return data_uri(path)


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
        uri = foto_data_uri(abs_path)
        peso_kb = round(len(uri) * 3 / 4 / 1024)  # aprox., base64 -> bytes reales
        print(f"  foto incrustada: {ruta} (~{peso_kb} KB)")
        return f"{prefijo}{quote}{uri}{quote}"

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
        proceso_js_liviano = f.read()
    # proceso.js se incrusta en CADA lámina (cada una es un documento aparte,
    # sin acceso al window.PROCESO del shell) — con fotos ya incrustadas en
    # base64, ese archivo puede pesar varios MB, y duplicarlo en las 9+
    # láminas dispararía el standalone a cientos de MB. Como sólo perfil.html
    # pinta `candidato.foto`, se arma una variante CON fotos sólo para esa
    # lámina; el resto (y el propio shell, que tampoco pinta fotos) usan la
    # versión liviana con las rutas relativas tal cual — así "Descargar datos
    # actualizados" también sigue bajando rutas normales, no un blob gigante.
    proceso_js_fotos = inline_fotos(proceso_js_liviano, deck_dir)

    with open(os.path.join(deck_dir, "slides", "_nav.js"), encoding="utf-8") as f:
        nav_js = f.read()

    # _editable.js (modo edición) es más nuevo que este script y sólo lo
    # referencian ALGUNAS láminas (perfil.html, insights.html): a diferencia
    # de _nav.js no puede ser obligatorio, o un deck generado antes de esta
    # feature (sin ese archivo en slides/) rompería el empaquetado.
    editable_js_path = os.path.join(deck_dir, "slides", "_editable.js")
    editable_js = None
    if os.path.isfile(editable_js_path):
        with open(editable_js_path, encoding="utf-8") as f:
            editable_js = f.read()

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
        if editable_js is not None and '<script src="_editable.js"></script>' in text:
            # _editable.js también lee location.search (?edit=/&edits=): tiene que
            # pasar por el mismo cambio a location.hash que el resto de la lámina.
            editable_js_hash = editable_js.replace("location.search", "location.hash.slice(1)")
            text = text.replace('<script src="_editable.js"></script>', "<script>\n" + editable_js_hash + "\n</script>")
        exigir(text, '<script src="../data/proceso.js"></script>', fname)
        proceso_js_para_lamina = proceso_js_fotos if fname == "perfil.html" else proceso_js_liviano
        text = text.replace('<script src="../data/proceso.js"></script>', "<script>\n" + proceso_js_para_lamina + "\n</script>")
        text = text.replace('src="../assets/logo-horizontal-positivo.svg"', f'src="{logo_pos}"')
        text = text.replace('src="../assets/logo-horizontal-negativo.svg"', f'src="{logo_neg}"')
        # El shell manda el tema por postMessage en vez de recargar (ver más
        # abajo, junto a applyTheme): cada lámina necesita escucharlo.
        exigir(text, "</body>", fname)
        text = text.replace(
            "</body>",
            "<script>window.addEventListener('message', function(e){"
            " if(e && e.data && e.data.deck === 'theme'){"
            " document.documentElement.dataset.theme = e.data.theme; } });</script>\n</body>",
            1,
        )
        slide_b64[fname] = base64.b64encode(text.encode("utf-8")).decode("ascii")

    with open(os.path.join(deck_dir, "deck.html"), encoding="utf-8") as f:
        shell = f.read()

    marca_cargar = "cargar('slides/'+s.file+'?b='+BUILD+'&theme='+theme+(s.params ? '&'+s.params : '')+'&edit='+(editMode?1:0)+editsQS+((atEnd||editMode) ? '&at=end' : ''));"
    marca_cv = "cvFrame.src = 'slides/cv.html?b='+BUILD+'&theme='+theme+'&'+s.cv;"
    for frag in ('<script src="data/proceso.js"></script>', 'src="assets/logo-horizontal-positivo.svg"',
                 'src="assets/logo-horizontal-negativo.svg"', marca_cargar, marca_cv, "const BUILD = "):
        exigir(shell, frag, "deck.html")

    shell = shell.replace('<script src="data/proceso.js"></script>', "<script>\n" + proceso_js_liviano + "\n</script>")
    # Igual que en las láminas: _editable.js es opcional (decks generados
    # antes de esta feature no traen esa etiqueta en deck.html).
    if editable_js is not None and '<script src="slides/_editable.js"></script>' in shell:
        shell = shell.replace('<script src="slides/_editable.js"></script>', "<script>\n" + editable_js + "\n</script>")
    shell = shell.replace('src="assets/logo-horizontal-positivo.svg"', f'src="{logo_pos}"')
    shell = shell.replace('src="assets/logo-horizontal-negativo.svg"', f'src="{logo_neg}"')

    # slideSrc() NO puede devolver la misma URL 'data:' dos veces para el mismo
    # archivo (p.ej. perfil.html para cada candidato, que sólo cambia el
    # '#hash'): un cambio SÓLO en el fragmento de una URL 'data:' ya vista es,
    # para Chrome, una navegación de ancla dentro del MISMO documento, no una
    # recarga — por eso el deck quedaba pegado en el primer candidato. La
    # solución: decodificar el HTML ya empaquetado y crear un blob: URL NUEVO
    # en cada llamada. Un blob: URL es único incluso para contenido idéntico,
    # así que cada 'cargar()' es SIEMPRE una navegación real, sin tocar el
    # mecanismo de '#hash' que ya usan las láminas para leer sus parámetros.
    mapa = "const SLIDE_B64 = {\n" + ",\n".join(
        f"  {js_str(fname)}: {js_str(slide_b64[fname])}" for fname in slide_files
    ) + (
        "\n};\n"
        "function slideSrc(file){\n"
        "  var bin = atob(SLIDE_B64[file]);\n"
        "  var bytes = new Uint8Array(bin.length);\n"
        "  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);\n"
        "  return URL.createObjectURL(new Blob([bytes], {type: 'text/html'}));\n"
        "}\n"
    )
    shell = shell.replace("const BUILD = ", mapa + "const BUILD = ", 1)

    shell = shell.replace(marca_cargar, "cargar(slideSrc(s.file)+'#b='+BUILD+'&theme='+theme+(s.params ? '&'+s.params : '')+'&edit='+(editMode?1:0)+editsQS+((atEnd||editMode) ? '&at=end' : ''));")
    shell = shell.replace(marca_cv, "cvFrame.src = slideSrc('cv.html')+'#b='+BUILD+'&theme='+theme+'&'+s.cv;")

    # El cambio de tema NO puede seguir recargando el iframe. Antes vivía en la
    # URL (?theme=...) y cambiarla obligaba a recargar — con URLs data: eso ya
    # no sirve: cambiar SÓLO el fragmento (#theme=...) es, para el navegador,
    # un salto de ancla dentro del MISMO documento, no una recarga (aparece
    # igual en frame.src, pero el documento real nunca se vuelve a pintar).
    # Probamos forzar la recarga con el truco 'about:blank' + rAF/setTimeout:
    # falla de forma intermitente incluso en el caso más simple (~50% de las
    # veces en pruebas repetidas con Playwright) — Chrome no garantiza que una
    # navegación a data: iniciada así (sin gesto del usuario "fresco") se
    # complete. No es un problema de temporización que se arregle con más
    # espera. La solución robusta es no depender de recargar el documento: se
    # le manda el tema por postMessage a la lámina ya cargada (la misma vía que
    # usa el resto del puente en _nav.js) y ella lo aplica en el momento, sin
    # navegar a ningún lado.
    theme_apply_orig = (
        "  if(cvAbierta){ cargarCV(); cargarSlide(true); }\n"
        "  else go(i);"
    )
    exigir(shell, theme_apply_orig, "deck.html")
    shell = shell.replace(theme_apply_orig, (
        "  try{ frame.contentWindow.postMessage({deck:'theme', theme:theme}, '*'); }catch(err){}\n"
        "  if(cvAbierta){ try{ cvFrame.contentWindow.postMessage({deck:'theme', theme:theme}, '*'); }catch(err){} }"
    ))

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
