---
name: actualizar-deck
description: Aplica al deck los cambios hechos con el modo edición del navegador (tecla E → botón "Descargar datos actualizados"). Busca en ~/Downloads el proceso-editado.js más reciente y lo mueve a decks/<slug>/data/proceso.js con el nombre correcto, así el usuario no tiene que hacerlo a mano. Úsala cuando digan cosas como "actualiza el deck", "apliqué mis ediciones", "ya descargué los cambios", "reemplaza el proceso.js con lo que edité" o "hice unos cambios, actualízalo" — típicamente después de haber usado el modo edición del deck.
---

# Actualizar deck con ediciones descargadas

Cuando alguien corrige texto en el deck con el modo edición (tecla `E` →
botón "Descargar datos actualizados"), el navegador deja el archivo en
`~/Downloads` como `proceso-editado.js` (o `proceso-editado (1).js`,
`(2).js`… si ya había uno con ese nombre). Esta skill hace el paso manual
que eso evita: mover ese archivo a la carpeta del deck con el nombre que
corresponde.

## Pasos

1. **Ubica el deck.** Si el usuario da el nombre o slug, úsalo. Si no,
   infierelo del contexto de la conversación (de qué deck se viene hablando);
   si sigue sin ser obvio y hay más de una carpeta en `decks/`, pregúntale
   cuál con `AskUserQuestion`.

2. **Ubica la descarga más reciente:**
   ```bash
   ls -t ~/Downloads/proceso-editado*.js 2>/dev/null | head -1
   ```
   Si no hay ninguna, dilo — no hay nada que aplicar.

3. **Valida antes de reemplazar** (liviano, no hace falta más): que sea JS
   válido y declare `window.PROCESO`:
   ```bash
   node -e "global.window={}; require('<descarga>'); console.log(window.PROCESO.meta.cargo)"
   ```
   Si falla, muestra el error y **no reemplaces nada** — mejor detectar un
   archivo roto ahora que dejar el deck en blanco.

4. **Reemplaza moviendo el archivo** (no lo copies: la descarga ya cumplió su
   función, y dejarla en `Downloads` solo siembra dudas la próxima vez sobre
   cuál es la vigente):
   ```bash
   chmod u+w "decks/<slug>/data/proceso.js" 2>/dev/null   # por si quedó de solo lectura
   mv "<descarga>" "decks/<slug>/data/proceso.js"
   ```

5. **Avisa en una línea** qué se aplicó y a qué deck. No empaquetes el
   standalone después de esto por tu cuenta — es un paso aparte que se hace
   sólo cuando lo piden (ver regla nº10 de `CLAUDE.md`).

## Ojo

- Si hay **más de un** `proceso-editado*.js` en `Downloads`, por defecto usa
  el más reciente. Sólo detente a comparar contra el `proceso.js` actual del
  deck si algo huele raro (por ejemplo, el usuario probó el modo edición
  varias veces y no está claro si esa última descarga tiene TODOS los
  cambios que espera) — no compliques el flujo si no hay señal de duda.
- No adivines el `<slug>` por el `meta.cargo`/`meta.empresa` del JS: no
  tienen por qué calzar con el nombre de la carpeta en `decks/`.
- No borres otras descargas `proceso-editado*.js` que queden en
  `Downloads` — son del usuario, no las toques salvo que te lo pida.
