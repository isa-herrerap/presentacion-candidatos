# Presentación de candidatos — deck parametrizable de Mandomedio

> Claude lee este archivo al inicio de cada sesión en esta carpeta.
> Si vas a trabajar acá, esto es lo mínimo que tienes que saber.

## Qué es esto

Sistema para generar el **deck de presentación de candidatos** que Mandomedio
muestra al cliente al cierre de un proceso de selección. El deck es HTML puro
(se abre con doble clic, sin servidor), con marca Mandomedio, temas claro y
oscuro, y láminas animadas.

**La secuencia es:** portada · contexto (universo de candidatos) · contexto-detalle
(el subgrupo del que hay ficha completa) · insights de la búsqueda · divisor ·
un perfil por candidato · comparativa interactiva · próximos pasos.

Los **insights** (veredictos de renta y perfil, motivos de descarte, lectura del
mercado) van ANTES de los candidatos: son el encuadre con el que el cliente mira
las fichas. Los **próximos pasos** cierran, y su contenido es el estándar de
Mandomedio escrito en la plantilla — no se puebla por proceso.

El **currículum no es una lámina de la secuencia**: se abre en una modal, sobre
el perfil, desde un botón discreto, y sólo si el candidato trae `cv`. Verlo es
opcional — el recorrido normal no pasa por ahí.

La arquitectura separa **plantilla** de **información**: las láminas son fijas
y todo lo que cambia por proceso vive en UN archivo (`data/proceso.js`).
Generar un deck = copiar la plantilla + escribir ese archivo.

## Mapa de la carpeta

```
presentacion-candidatos/
├── CLAUDE.md               ← este archivo
├── README.md               ← guía de uso para humanos
├── deck-template/          ← PLANTILLA MAESTRA (no se edita, ver regla nº1)
│   ├── deck.html           ← shell: navegación, temas, logo, modal del CV
│   ├── slides/             ← plantillas de lámina + _nav.js (puente shell↔lámina)
│   │                         y _editable.js (puente del modo edición, ver regla nº10)
│   ├── data/proceso.js     ← ejemplo canónico (mockup Ñuble, 100% inventado)
│   ├── data/SCHEMA.md      ← CONTRATO: cada campo, su fuente y sus límites
│   └── assets/             ← logos oficiales
├── casos/1..4/             ← documentos reales de 4 procesos (perfil docx,
│                             screening xlsx, CVs pdf) — evidencia cruda
├── decks/                  ← acá nacen los decks generados (uno por proceso,
│                             gitignored: son procesos reales de clientes).
│                             Si uno queda desactualizado frente a la
│                             plantilla, se sincroniza copiando de vuelta los
│                             archivos que cambiaron (deck.html, slides/*) —
│                             SIN tocar su data/proceso.js.
├── scripts/extraer_caso.py ← docx/xlsx → texto plano
└── .claude/                ← skill generar-deck, agente verificador-deck, hook
```

## Reglas

1. **`deck-template/` no se toca.** Los decks se generan copiando la plantilla
   a `decks/<slug>/` y escribiendo SOLO su `data/proceso.js`. Un hook pide
   confirmación si intentas editar la plantilla. Si una lámina se ve mal, el
   arreglo es acortar los datos (límites en `SCHEMA.md`), no editar el HTML.
2. **Para generar un deck usa la skill `/generar-deck`** — trae el flujo
   completo (extraer → poblar → preguntar gaps → verificar → entregar).
3. **PII**: los documentos de `casos/` traen RUT, teléfonos, direcciones y
   fotos. Nada de eso pasa a un deck, log o reporte. Las carpetas de casos son
   evidencia cruda: no editar, no renombrar, no borrar.
4. **No inventar datos.** Lo que no está en los documentos se pregunta a la
   consultora o se omite. El único contenido inventado permitido es el mockup
   Ñuble de la plantilla.
5. **Idioma**: español neutro/chileno, tuteo (puedes, mira, verifica). Nunca
   voseo argentino. Los textos del deck los lee el CLIENTE: registro
   profesional, sin jerga interna.
6. **Verificación visual obligatoria**: antes de declarar un deck listo,
   ábrelo en el navegador (Playwright), recorre todas las láminas en ambos
   temas y captura screenshots. Un deck no revisado no se entrega.
7. **El deck se usa con doble clic (`file://`), no servido.** Playwright y
   Claude in Chrome sólo abren `http://`, así que para verificar hay que
   levantar `python3 -m http.server` — pero ojo: **servido no es equivalente**.
   Bajo `file://` Chrome le da a cada iframe un origen propio, así que el shell
   NO puede leer nada del documento de la lámina (lanza `SecurityError`). Todo
   lo que cruce ese límite va por `postMessage` (ver `slides/_nav.js`); si
   escribes código que acceda a `frame.contentWindow.algo`, funcionará en tu
   verificación y fallará en las manos del usuario.
8. **Si editas una lámina, sube la constante `BUILD` de `deck.html`.** Es el
   cache-bust del iframe (`?b=…`): sin subirlo, el navegador sigue sirviendo la
   lámina vieja y vas a creer que tu cambio no funcionó — o peor, vas a
   "arreglar" algo que ya estaba bien. Pasa siempre; que sea el primer
   sospechoso cuando algo no se refleje.
9. **Piso tipográfico: ningún texto visible baja de 12 px.** Y al ajustar
   tamaños, sube **el techo del `clamp()` junto con el piso**: la lámina ocupa
   el viewport sin escalado, así que un `clamp(9.5px, 1.3vh, 10.5px)` se dibuja
   a 10,5 px reales hasta en un 4K. El techo es el que deja el texto chico en
   pantalla grande, no el piso.
10. **Empaqueta el deck en standalone cuando te lo pidan — así, sin más
    pasos.** Si alguien dice algo como "empaqueta el deck", "hazlo
    standalone", "prepáralo/déjalo listo para mandar" o "genérame el archivo
    para la presentación", corre
    `python3 scripts/empaquetar_standalone.py decks/<slug>` (identifica
    `<slug>` por el nombre de carpeta en `decks/` o por lo que diga el
    usuario) y avisa dónde quedó el `.html` resultante. Es un solo comando,
    no hace falta pedir confirmación de más ni explicar el script — el
    docstring de `scripts/empaquetar_standalone.py` tiene el detalle si algo
    falla. Recuérdale al usuario empaquetar AL FINAL, después de revisar y
    corregir textos (ver más abajo): el standalone es un archivo aparte que
    no se edita él mismo, así que si corrige algo después hay que volver a
    empaquetar.

## Setup (una sola vez por máquina)

```bash
python3 -m venv .venv
.venv/bin/pip install openpyxl python-docx
```

(Solo lo usa `scripts/extraer_caso.py`; si no está, el script te lo recuerda.)

## Cómo se usa el deck terminado

`decks/<slug>/deck.html` se abre con doble clic. Flechas ← → navegan (varias
láminas tienen pasos internos), `T` alterna tema claro/oscuro (queda
recordado), `F` pantalla completa, `Home`/`End` saltan al inicio/final. En la
comparativa se clickean hasta 3 candidatos para verlos lado a lado (Esc limpia).
En un perfil, el botón **Ver currículum** abre el CV en una modal encima de la
lámina; se cierra con la ×, `Esc`, un clic afuera o `↑`, y el perfil sigue donde
estaba (la flecha `↓` también lo abre, pero ya no se anuncia).

`E` activa el **modo edición**: los textos largos de perfil e insights quedan
editables directo en el navegador, sin pasar por Claude (detalle completo en
el README, sección "Corregir un texto sin pedírselo a Claude"). Cuando el
usuario ya está conforme con el contenido, toca empaquetar — ver regla nº10.

## Contexto de marca

La plantilla ya cumple el brandbook de Mandomedio (Red Hat Display + Inter +
Dongra; naranjo #FD650D, navy #1E2D3B, peach #FFAE7F como tinta solo sobre
oscuro). Por eso mismo no hay que "mejorarla" estéticamente al generar decks:
la marca ya está resuelta en las plantillas.
