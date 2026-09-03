# Deck de presentación de candidatos · Mandomedio

Genera la presentación HTML que se muestra al cliente al cierre de un proceso
de selección, a partir de los documentos que ya produces en el proceso: el
**perfil de cargo** (Word o PDF), la **planilla de screening** (Excel) y los
**CV** (PDF) de los candidatos que avanzan.

## Qué necesitas

- [Claude Code](https://claude.com/claude-code) instalado (app de escritorio o
  terminal).
- Google Chrome (para que Claude verifique el deck antes de entregártelo).

## Cómo generar un deck (3 pasos)

1. **Copia los documentos del proceso** a una subcarpeta de `casos/`
   (ej: `casos/5/`): el perfil .docx o .pdf, el screening .xlsx y los CV .pdf
   de los candidatos que avanzan. `casos/` viene vacía a propósito — ver
   `casos/LEEME.txt`.

2. **Abre Claude Code en esta carpeta** y escribe:

   ```
   /generar-deck casos/5
   ```

   Claude va a leer los documentos, armar los datos y hacerte algunas
   preguntas que solo tú puedes responder (la fecha de presentación, en qué
   destaca cada candidato, los veredictos del cierre). Responde y déjalo
   trabajar: al final verifica el deck en el navegador él solo.

3. **Abre el resultado**: `decks/<nombre-del-proceso>/deck.html` — doble clic
   y listo, no necesita internet ni instalar nada. Esa carpeta es
   autocontenida: puedes comprimirla y mandarla.

## Cómo se presenta

- Flechas `←` `→` para avanzar (varias láminas se revelan por pasos).
- `T` cambia entre tema claro y oscuro. `F` pantalla completa.
- En la lámina comparativa, haz clic en 2 o 3 candidatos para verlos lado a
  lado (Esc deshace).

## Importante

- El deck de ejemplo que trae la plantilla (Gestor Social Ñuble) es un mockup
  con datos 100% inventados — es la referencia visual, no un proceso real.
- Los documentos de `casos/` contienen datos personales: quedan solo como
  fuente, nunca aparecen RUT, teléfonos ni direcciones en el deck.
- Si una lámina se ve apretada, dile a Claude que acorte los textos de esa
  lámina — no intentes editar el HTML a mano.
