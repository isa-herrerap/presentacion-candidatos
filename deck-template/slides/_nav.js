/* ============================================================================
   Puente de navegación entre el shell (deck.html) y esta lámina.

   POR QUÉ EXISTE: la lámina vive dentro de un iframe y es ELLA la que sabe si
   le quedan pasos internos por revelar. Antes el shell se lo preguntaba
   llamando directo a `frame.contentWindow.deckStep(dir)`. Eso funciona cuando
   el deck se sirve por HTTP, pero el deck se abre con doble clic — protocolo
   file:// — y ahí Chrome le da a cada iframe un origen propio: el acceso lanza
   una excepción de seguridad, el `catch` del shell la tragaba, el shell creía
   que la lámina no tenía pasos y saltaba de diapo. Síntoma: desde el nombre
   del candidato se pasaba directo a su currículum, y el perfil sólo se veía
   volviendo hacia atrás.

   La conversación va ahora por postMessage, que sí cruza orígenes. El contrato
   es al revés que antes: manda la lámina. Recibe la flecha (venga del shell o
   de su propio teclado, según dónde esté el foco), intenta consumir un paso
   interno y le responde al shell qué pasó:
     {deck:'step'}          consumí un paso, no cambies de lámina
     {deck:'nav', dir}      ya no me quedan pasos, cambia de lámina
     {deck:'cmd', key}      tecla global (tema, pantalla completa, inicio/fin)

   Este archivo lo cargan TODAS las láminas, tengan pasos o no: las que no
   definen window.deckStep simplemente responden 'nav' siempre.
   ============================================================================ */
(function(){
  var AVANZAR = ['ArrowRight', 'PageDown', ' ', 'Enter'];
  var VOLVER  = ['ArrowLeft', 'PageUp'];
  // ↓ y ↑ NO avanzan ni retroceden: son el eje del desvío al currículum, que
  // vive en el shell (abrir/cerrar el CV del candidato). Por eso viajan como
  // comando global y no como paso interno de la lámina.
  var GLOBALES = ['t', 'T', 'f', 'F', 'Home', 'End', 'ArrowDown', 'ArrowUp'];

  function alShell(msg){
    try { parent.postMessage(msg, '*'); } catch (err) {}
  }

  function paso(dir){
    // Este archivo se carga en el <head>, pero window.deckStep lo define el
    // script del final del <body>. Una flecha que llegue en ese intervalo
    // encontraría deckStep todavía indefinido y le diríamos al shell "ya no me
    // quedan pasos" — que es justo el salto de lámina que esto viene a evitar.
    // Mientras la lámina se arma, la tecla se descarta (son milisegundos: es un
    // doble toque, no una intención distinta).
    if (document.readyState === 'loading') return;

    var consumido = false;
    try { consumido = !!(window.deckStep && window.deckStep(dir)); } catch (err) {}
    alShell(consumido ? { deck: 'step' } : { deck: 'nav', dir: dir });
  }

  window.addEventListener('message', function(e){
    if (e.data && e.data.deck === 'key') paso(e.data.dir);
  });

  // El foco puede quedar DENTRO del iframe — basta un clic en cualquier parte
  // de la lámina — y entonces las teclas las recibe este documento, no el
  // shell. Por eso la lámina también escucha por su cuenta, y usa exactamente
  // el mismo camino para que el resultado sea idéntico en los dos casos.
  document.addEventListener('keydown', function(e){
    // Enter y espacio ACTIVAN el elemento enfocado (las pills de gráfico, los
    // encabezados del comparador). Si el foco está en uno de esos controles,
    // la tecla es suya y no del deck; las flechas, en cambio, siempre navegan.
    if ((e.key === 'Enter' || e.key === ' ') && esControl(e.target)) return;

    if (AVANZAR.indexOf(e.key) !== -1){ e.preventDefault(); paso(1); }
    else if (VOLVER.indexOf(e.key) !== -1){ e.preventDefault(); paso(-1); }
    else if (GLOBALES.indexOf(e.key) !== -1){
      // Las flechas verticales scrollean la lámina si se las deja pasar.
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') e.preventDefault();
      alShell({ deck: 'cmd', key: e.key });
    }
  });

  // "Control" = algo que HACE algo con Enter/Espacio. Ojo con lo que NO está en
  // esta lista: `[tabindex]` a secas. Estaba, y traía una falla silenciosa en
  // plena presentación — las columnas del gráfico de contexto son enfocables
  // (para que el teclado revele el número real igual que el mouse) pero no
  // hacen nada al activarse; bastaba UN clic sobre el gráfico para que esa
  // columna quedara enfocada y el Espacio dejara de pasar de lámina, sin ningún
  // aviso. Un elemento que de verdad se activa declara `role="button"` (o es un
  // <button>), y ésos sí se quedan con la tecla: en la lámina de detalle,
  // Espacio sobre una columna enfocada aplica su filtro, que es lo correcto.
  // Las flechas navegan SIEMPRE, pase lo que pase con el foco.
  function esControl(el){
    try {
      return !!(el && el.closest && el.closest('button, a, input, select, textarea, [role="button"]'));
    } catch (err) { return false; }
  }
})();
