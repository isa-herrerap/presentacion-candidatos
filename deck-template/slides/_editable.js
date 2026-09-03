/* ============================================================================
   Modo edición: deja corregir directo en el navegador los textos largos del
   deck (tesis, motivación, insights, motivos de descarte…) sin pedirle el
   cambio a Claude cada vez. Mismo rol que _nav.js —un puente compartido—,
   pero éste lo cargan tanto las láminas con campos editables COMO el propio
   shell (deck.html): por eso setPath vive en un solo lugar y no duplicado.

   CÓMO ENTRAN LOS CAMBIOS A LA LÁMINA: el shell manda &edit=1 (modo activo) y
   &edits=<JSON> ({path: valorNuevo}) en la URL de cada lámina. Este archivo se
   carga en el <head>, justo después de proceso.js y antes del <script> de
   pintado del final del <body> — así que cuando ese script lee P.candidatos[…]
   ya está viendo los valores editados, sin que su lógica cambie en nada.

   CÓMO SALEN LOS CAMBIOS DE LA LÁMINA: cada campo que se vuelve editable
   (hazEditable) manda {deck:'edit', path, value} por postMessage al soltar el
   foco o tras una pausa de escritura. El shell los junta en memoria (viven
   mientras la pestaña siga abierta, no hace falta localStorage: el shell no
   se recarga al navegar entre láminas) y arma el archivo a exportar con el
   mismo setPath.
   ============================================================================ */
(function(){
  // path tipo "candidatos.0.perfil.tesis" → naveg­a el objeto por partes. No
  // inventa ramas que no existan: si el dato no está, no hace nada (más vale
  // un campo que no se actualiza que reventar el export por un path raro).
  function setPath(obj, path, value){
    var partes = path.split('.');
    var cur = obj;
    for (var i = 0; i < partes.length - 1; i++){
      var k = partes[i];
      if (cur == null || cur[k] == null) return;
      cur = cur[k];
    }
    if (cur == null) return;
    cur[partes[partes.length - 1]] = value;
  }

  // El contrato de richtext de data/proceso.js (ver SCHEMA.md) admite SOLO
  // <b>: lo que el usuario pegue o teclee con otro formato se aplana acá,
  // para no dejar basura de HTML dentro del dato.
  function limpiarRichtext(html){
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    (function limpiar(nodo){
      Array.prototype.slice.call(nodo.childNodes).forEach(function(n){
        if (n.nodeType === 1){
          limpiar(n);
          if (n.tagName !== 'B'){
            while (n.firstChild) n.parentNode.insertBefore(n.firstChild, n);
            n.parentNode.removeChild(n);
          }
        }
      });
    })(tmp);
    return tmp.innerHTML;
  }

  window.DeckEditable = { setPath: setPath, limpiarRichtext: limpiarRichtext };

  // De acá para abajo sólo corre dentro de una LÁMINA: el shell llama
  // setPath directo (para armar el export) y no necesita nada más de este
  // archivo. Sin PROCESO no hay nada que preparar.
  if (!window.PROCESO) return;

  var qs = new URLSearchParams(location.search);
  var EDIT_MODE = qs.get('edit') === '1';

  var raw = qs.get('edits');
  if (raw){
    var edits = {};
    try { edits = JSON.parse(raw); } catch (err) {}
    Object.keys(edits).forEach(function(path){ setPath(window.PROCESO, path, edits[path]); });
  }

  if (!EDIT_MODE) return;

  // Aviso visual de qué es editable: un borde punteado sutil, sólo al pasar
  // el mouse o al enfocar. Nada que compita con el diseño del resto de la
  // lámina mientras no se está tocando ese campo.
  var estilo = document.createElement('style');
  estilo.textContent =
    '.deck-editable{outline:1px dashed transparent;outline-offset:3px;cursor:text;border-radius:3px;transition:outline-color .15s ease}' +
    '.deck-editable:hover{outline-color:rgba(253,101,13,.45)}' +
    '.deck-editable:focus{outline:1px dashed #FD650D}';
  document.head.appendChild(estilo);

  // opts.richtext: si el campo acepta <b> (ver SCHEMA.md), se manda
  // innerHTML saneado; si no, textContent — para que un campo de texto plano
  // no pueda terminar con marcas pegadas por accidente.
  window.hazEditable = function(el, path, opts){
    if (!EDIT_MODE || !el || !path) return;
    opts = opts || {};
    el.contentEditable = 'true';
    el.classList.add('deck-editable');

    // Pegar SIEMPRE como texto plano: pegar desde Word/un mail arrastraría
    // estilos, tamaños de fuente y quién sabe qué más adentro del dato.
    el.addEventListener('paste', function(e){
      e.preventDefault();
      var texto = (e.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, texto);
    });

    // Estos campos son una sola línea de texto corrido (tesis, motivación,
    // un ítem de lista…): Enter confirma el cambio, no abre un párrafo nuevo.
    el.addEventListener('keydown', function(e){
      if (e.key === 'Enter'){ e.preventDefault(); el.blur(); }
    });

    var t = null;
    function mandar(){
      var value = opts.richtext ? limpiarRichtext(el.innerHTML) : el.textContent;
      try { parent.postMessage({ deck: 'edit', path: path, value: value }, '*'); } catch (err) {}
    }
    el.addEventListener('input', function(){
      clearTimeout(t);
      t = setTimeout(mandar, 500);
    });
    el.addEventListener('blur', function(){ clearTimeout(t); mandar(); });
  };
})();
