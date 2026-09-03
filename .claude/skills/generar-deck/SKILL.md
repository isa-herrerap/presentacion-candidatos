---
name: generar-deck
description: Genera el DECK HTML navegable de presentación de candidatos de Mandomedio (láminas que se proyectan en la reunión con el cliente) a partir del perfil de cargo, la planilla de screening y los CV de un proceso. Úsala cuando se pida armar, poblar, generar o actualizar el deck, la presentación o las láminas de un proceso, o cuando el usuario apunte a una carpeta de `casos/` — aunque no diga la palabra "deck" (p.ej. "hazme la presentación del caso Besalco", "arma las láminas con los candidatos del screening"). NO la uses si lo que piden es la LONG LIST, la planilla comparativa o el Excel de candidatos: eso es la skill `long-list`, que produce un .xlsx y no un deck. Si la petición dice "long list", "planilla", "Excel" o "tabla comparativa", es la otra.
---

# Generar deck de presentación de candidatos

Produce un deck navegable en `decks/<slug-del-proceso>/` copiando la plantilla
`deck-template/` y escribiendo **un solo archivo**: `data/proceso.js`. Las
láminas son plantillas fijas que renderizan ese archivo, y la secuencia sale
sola de los datos:

```
portada · contexto · contexto-detalle · insights · divisor · perfil ×N · comparativa · próximos pasos
```

El **currículum no es una lámina de la secuencia**: cuelga del perfil. La lámina
de perfil muestra un botón "Ver currículum" —sólo si ese candidato trae `cv`—
que lo abre en una modal encima; se cierra con la ×, `Esc`, `↑` o clickeando
fuera, y el perfil sigue donde estaba. Un candidato genera lámina de perfil si
trae `perfil`; el bloque `cv` sólo agrega el botón.

**La regla de oro: jamás edites `deck.html` ni `slides/*.html`.** Si algo se ve
mal, el arreglo va en los datos (menos texto, menos ítems) o se conversa con
Vicente; tocar las plantillas rompe la coreografía calibrada y desincroniza el
deck de la plantilla maestra.

## Flujo

### 1 · Ubicar y extraer los documentos del caso

La carpeta de un caso trae: un **perfil o descriptor de cargo** (normalmente .docx, pero a
veces llega en **.pdf**), un **screening** (.xlsx) y los **CV** (.pdf) de los
candidatos que avanzan. Extrae docx y xlsx a texto:

```bash
python3 scripts/extraer_caso.py casos/<n>
```

(Acepta también rutas absolutas para script y carpeta — no necesitas `cd`.)
Deja `casos/<n>/_extraccion/{perfil.txt, screening.txt}`. Si faltan las
dependencias, el propio script imprime cómo crear el venv (una sola vez).
Los CV los lees directo con el Read tool (soporta PDF).

**Si el perfil de cargo vino en PDF**: el script no lo convierte (sólo
procesa .docx) y te avisa al correr. En ese caso no hay `perfil.txt` —
identifica cuál de los PDF de la carpeta es el perfil (no es un CV, léelo por
el nombre del archivo o abriendo el primero) y léelo directo con el Read
tool, igual que un CV.

### 2 · Leer el contrato de datos y los documentos

Lee **completo** `deck-template/data/SCHEMA.md`: define cada campo de
`proceso.js`, su fuente en los documentos, los límites duros por lámina y las
reglas de normalización. Es el mapa; no improvises el esquema de memoria.
`deck-template/data/proceso.js` (el mockup Ñuble) es la instancia viva de ese
contrato, con el porqué de cada campo en los comentarios: úsalo como referencia
de forma y tono.

Luego lee el perfil (`perfil.txt`, o el PDF directo si vino en ese formato),
`screening.txt` y TODOS los CV. Claves de lectura del
screening (verificadas en casos reales):

- La fila de encabezados define columnas fijas (Nombre, Edad, Comuna,
  Título - Institución, Trab., Cargo, Empresa, Pretensión de Renta, Avanza a
  LL…) y un bloque de **criterios variables del cargo** en el medio — esos
  criterios son los "Requisitos del cargo" del perfil y las filas variables de
  la comparativa.
- La columna **Observaciones** es texto libre con oro adentro: renta líquida
  actual, "Motivación por el cargo/cambio:", "Salida de <empresa>:" y juicios
  del consultor. Extrae cada pieza por candidato.
- **Presentados = filas con Avanza a LL ≈ Sí** (y normalmente CV 1:1). Ojo con
  la nomenclatura: la hoja suele llamarse "Long list completa" y aun así la
  columna dice "Avanza a LL" — no te enredes con el nombre; la señal confiable
  es el cruce con los CV de la carpeta (los Sí calzan 1:1 con los PDF). Los que
  no avanzan igual sirven: alimentan el contexto y los insights de la búsqueda.
- Espera suciedad: RUT y notas de gestión pegados al nombre, typos de empresas,
  rentas como "2.7" (= $2.700.000), floats de Excel (39.0), columnas sin
  encabezado con juicios, celdas vacías. SCHEMA.md § "Reglas de calidad" dice
  cómo tratar cada una.

### 3 · Poblar el contexto: UNA FILA POR CANDIDATO

El contexto **no se puebla con distribuciones ya sumadas**: se declaran las
lecturas y se escribe el padrón crudo. Las dos láminas suman, calculan los
porcentajes y cruzan los filtros solas.

**LA ESTRUCTURA DE LAS DOS LÁMINAS ES FIJA — no la elijas por proceso.** Este
es el error que más se ha repetido al generar decks reales: cambiar qué se
grafica según lo que el screening tenga a mano. La estructura es siempre la
misma, y es lo que hace que dos decks de Mandomedio se lean igual:

- **Lámina 2 · universo completo** (hunting **+** postulación juntos): un solo
  gráfico grande, la dimensión `origen`. `contexto.principal` es **siempre
  `"origen"`**.
- **Lámina 3 · sólo el subgrupo de HUNTING**
  (`detalle.filtro: {dim:"origen", valor:"Hunting"}`, siempre): tres gráficos,
  **siempre estos tres**:
  1. **Años de experiencia** (`experiencia`)
  2. **Cargo actual** (`cargo`)
  3. **Empresa actual** (`empresa`)

O sea, `contexto.dimensiones` tiene **exactamente cuatro entradas fijas**:
`origen`, `experiencia`, `cargo`, `empresa`. Lo que cambia por proceso son los
`valores[]` de cada una (qué tramos de experiencia, qué cargos, qué empresas),
**nunca qué dimensiones existen**, y **nunca los reemplaces por edad, comuna o
formación** sólo porque ese dato sí esté disponible.

**Las tres distribuciones de la lámina 3 se PREGUNTAN, no se calculan.** La
consultora las levanta a mano desde LinkedIn sobre todo el grupo hunteado;
el screening sólo cubre a los que llegaron a llamada, que son muchos menos.
Derivarlas del screening o de los CV es dibujar a 55 personas con la forma de
9 (ver el paso 4, punto 1c: se pregunta abierto, sin ofrecer opciones).

Por qué la lámina 3 recorta a hunting: de los que llegan por postulación
normalmente no hay ficha (experiencia, cargo, empresa). Graficar los dos grupos
juntos mostraría el perfil de un subgrupo presentado como si fuera el de todo
el universo.

Con eso fijo, lo que queda por poblar:

- `contexto.dimensiones[].valores[]` — el orden de `valores` fija el orden de
  las columnas (en tramos, `0-3 años` va antes que `8+` aunque sea la más
  chica) y cada valor declara su color con `slot`: `c1` naranjo (la serie
  principal), `c2`/`c3` secundarios. Son tres slots: la dimensión se lee bien
  hasta con 3 valores; con muchos valores distintos, agrupa la cola en "Otros".
- `contexto.candidatos[]` — **una fila por persona del universo completo**. El
  número grande de la primera lámina es literalmente el largo de este arreglo:
  245 candidatos son 245 objetos. Es tedioso y está bien: es lo que permite que
  clickear una columna recalcule las otras. Las filas de postulación traen
  **sólo `origen`** (no hay ficha de ellos); las de hunting traen las cuatro.

**Por qué no se rellena lo que no se tiene** — el error más caro de esta lámina.
Un campo ausente en una fila no es cero: es "el screening no trae esa lectura de
esta persona". Esa fila no cuenta en esa dimensión pero sí en el total, así que
las columnas pueden sumar menos que el número grande y eso es correcto, no un
descuadre que haya que cuadrar.

El caso típico: del universo completo sólo se tiene una lectura —de dónde llegó
cada uno— y la ficha (experiencia, cargo, última empresa) existe sólo para el
subgrupo al que se le hizo ficha, normalmente los contactados por hunting. Eso
se modela con `principal: "origen"` y `detalle.filtro` apuntando a ese subgrupo.
**No inventes las filas sin dato**: rellenar el padrón con valores plausibles
convierte 31 fichas en un retrato falso de 245 personas, y es justo lo que la
clienta va a citar en la reunión.

**El universo completo se pregunta, nunca se cuenta desde el screening.** El
screening de un caso real casi siempre trae solo a quienes llegaron a una
llamada de la consultora — no es la lista completa de postulantes. Tratar esas
filas como si fueran "todo el universo" es inventar un dato que no está: que
el screening traiga 15 filas no significa que hubo 15 candidatos en el
proceso. Antes de escribir `contexto`, pregúntale siempre a la consultora
(nunca lo infieras, nunca lo dejes con un default): cuántos candidatos hubo en
total, cuántos llegaron por hunting y cuántos por postulación, y cuáles fueron
las principales empresas y cargos de origen del universo completo. Esta
pregunta no tiene default y no se salta aunque el usuario haya pedido correr
sin preguntas — sin la respuesta, `contexto` no se puede poblar de forma
honesta (ver el punto 1 de "Preguntas que SIEMPRE se hacen" en el paso 4).

### 4 · Armar el borrador de `proceso.js` y levantar los gaps

Construye el objeto completo siguiendo SCHEMA.md. Redacta en español profesional
neutro — el deck lo lee el **cliente**; los juicios internos del consultor ("me
encanta", "no me mató") se reescriben, nunca se copian.

Campos donde se falla seguido al poblar un candidato:

- **`nombre` recortado a un nombre + dos apellidos**: el screening suele traer
  el nombre legal completo (dos nombres de pila u más). Por defecto se deja
  sólo el PRIMERO y se bota el segundo — no importa cómo firme su CV. La
  excepción es un **nombre compuesto típico chileno** ("María Paz", "José
  Miguel", "Juan Pablo"…), que va siempre junto. Nombres modernos o de origen
  no español (Camila, Daniela, Ayleen…) casi nunca son compuestos aunque
  vengan con un segundo nombre pegado. Ver el criterio completo en
  SCHEMA.md, fila `nombre`.
- **`cargoCorto` además de `cargoActual`**: el largo es el cargo como se llama y
  lo usa el perfil; el corto lo usa la comparativa, donde cinco candidatos
  comparten cinco columnas. Es un campo, no un recorte: medido sobre la lámina,
  `cargoCorto` hasta ~22 caracteres y `empresaActual` hasta ~26 entran en una
  línea aun en 1280×720.
- **`foto` (opcional)**: ruta relativa a `deck-template/`. Sin ella el perfil
  dibuja igual el círculo con las iniciales — estado válido y presentable, no un
  hueco. **No la saques del CV**: sólo se puebla con una imagen que la consultora
  entregue para el deck.
- **`perfil.evidencia`**: un `lead` y dos listas de texto plano, `funciones` y
  `logros`; las etiquetas las pone la plantilla (ya no hay ejes libres por
  proceso). Lo que hace en el día a día va en `funciones`; lo que construyó o
  consiguió, en `logros`. `logros` puede ir vacío y ese grupo no se dibuja.
  **Fuente: primero el screening, el CV sólo para completar.** La columna
  Observaciones y los juicios del consultor son la base — ahí está lo que la
  consultora ya evaluó como relevante. Recurre al CV sólo si el screening
  viene pobre en un candidato o falta un dato puntual que el CV sí trae. Esto
  no es sólo orden de prioridad: el CV el cliente lo puede llegar a ver
  aparte (queda colgado en la modal del perfil), así que copiarlo tal cual
  duplica contenido y arrastra su tono técnico interno a la lámina. Sea cual
  sea la fuente, **reescribe en lenguaje llano** — nada de jerga interna o
  siglas de industria sin explicar: el que lee esto es el cliente, no otro
  reclutador.
- **`perfil.salidas[].duracion` va SIEMPRE, en todas las salidas.** Se
  **deriva** cruzando la salida con la entrada equivalente de `cv.trayectoria`
  del mismo candidato, con el redondeo que documenta `proceso.js`. Si el CV
  cierra el empleo sólo con el año, derívala del **inicio del empleo
  siguiente** y deja el porqué en un comentario. Si ni así se puede,
  pregúntale a la consultora — no la omitas ni la estimes a ojo. Un candidato
  sin salidas (primera y única empresa) es otra cosa: ahí `salidas` va vacío y
  la lámina pinta "No aplica".
- **`estudios[].validado`** es booleano y el lenguaje quedó cerrado en dos
  estados: **Validado** / **Pendiente**. No existe `estudios[].nota` ni un tercer
  estado escrito a mano.
- **`desde` (y `hasta` si ya salió del cargo)**: desde cuándo está en **ESE
  cargo**, no en la empresa — alguien puede llevar tres años en la compañía y
  seis meses en el puesto; va el puesto. Sale de la entrada vigente de
  `cv.trayectoria`, en formato `"May 2019"` (o sólo el año si el CV no trae el
  mes). El perfil lo pinta bajo el cargo: "Desde may 2019". Si el candidato ya
  no está ahí (`trabajando:false`), agrega `hasta` y la lámina muestra el tramo
  completo ("Jun 2025 — Mar 2026") en vez de un "Desde…" que haría pensar que
  sigue en el puesto.
- **`cv.trayectoria`** admite hasta 8 entradas y **la plantilla las ordena sola**
  (más reciente → más antigua). No ordenes: cuida el formato de `periodo`
  (`"Mar 2019 — Nov 2020"`, mes abreviado en español + año), que es de donde
  salen ese orden y la marca de cargo vigente (`"— Presente"`).
- **`cv.trayectoria[].duracion` va SIEMPRE**, en todas las entradas de todos los
  candidatos: es cuánto duró ese empleo, bajo el período ("3 años"). Mismo
  cálculo que `salidas[].duracion`. Dos casos con regla propia: el **empleo
  vigente** se calcula hasta `meta.fecha` (la lámina no lo calcula sola a
  propósito — si lo hiciera, el número crecería cada vez que se abre el archivo
  y el deck es una foto de su fecha); y un **período sin meses** ("2022 — 2025")
  no se puede calcular exacto, así que va `"aprox. 3 años"` — el "aprox." se
  escribe, no se finge precisión que el CV no da.
- **`cv.trayectoria[].queHace` va SIEMPRE, en TODA empresa de TODO candidato**
  (no solo en las que la clienta "probablemente no conoce" — ese criterio es
  subjetivo y deja huecos). Es una frase MUY corta (6-13 palabras) de a qué se
  dedica esa empresa; se pinta como tooltip al pasar el mouse sobre su nombre
  en el CV. Investígala con búsqueda web, usando las pistas que el propio CV ya
  da (rubro, marcas que menciona, ciudad, bullets de funciones) para confirmar
  que el resultado encontrado es ESA empresa y no una homónima — típico con
  agencias o distribuidoras que comparten nombre con otra empresa en otro país.
  Si la búsqueda no encuentra nada confiable (agencia chica, extranjera,
  empresa ya cerrada), redacta la frase a partir de lo que el propio CV ya
  cuenta de ella en sus bullets, en vez de inventar un dato externo sin
  verificar. Y de paso: si la búsqueda destapa un typo en el nombre de la
  empresa (`org`), corrígelo — es el mismo criterio que ya aplicas a nombres de
  personas e instituciones.
- **Comparativa**: no hay fila de comuna ni de "¿trabajando hoy?". La comuna va
  en el encabezado de la columna (**sólo comuna, sin región**) y la fila "Cargo
  actual" combina `cargoCorto` + el estado del vínculo (`trabajando`) +
  `empresaActual`.
- **`rentaActual`**: aunque el dato esté en el screening, no se pinta
  automáticamente — mostrarla o no es una decisión de la consultora que se
  pregunta siempre (ver punto 2 más abajo). `rentaPretension` no entra en esa
  pregunta: esa va siempre.

Mientras armas, anota todo lo que el documento NO trae. Hay tres grupos de
preguntas, según cuánto se puede automatizar la respuesta.

**Mecánica de la pregunta: TODO pasa por `AskUserQuestion`**, sin excepción —
nunca un párrafo o una lista donde la consultora tenga que leer todo y
responder de corrido. Cada pregunta es su propia tarjeta clickeable, con 2-4
opciones (además del "Otro" que la herramienta ya ofrece para texto libre).
Si un grupo trae más de 4 preguntas ese día, mándalas en varias tandas, no
todas en una.

Las opciones que ofreces cambian según el tipo de pregunta:

- **Grupo B** (y las confirmaciones del grupo C): las opciones son tu
  propuesta concreta ya redactada — la consultora marca cuál(es) quedan.
- **Grupo A, punto 1 (universo de candidatos)**: acá la cifra o el desglose
  en sí **nunca se propone como opción** — eso sigue prohibido, es lo que
  evita sesgar la respuesta con tramos inventados (ver el detalle en 1c).
  Ojo con un detalle de la herramienta: clickear una opción normal entrega
  tal cual el texto de esa opción como respuesta — **no abre un cuadro para
  escribir el número**, sólo "Otro" lo hace. Por eso una opción tipo "tengo
  el dato, lo escribo" es una trampa: si la clickean, el número nunca llega.
  Las únicas opciones válidas son estados terminales que YA son la respuesta
  completa, exactamente dos:
  1. "No lo sé / no tengo este dato"
  2. "Lo tengo que revisar, te confirmo después"

  Ambas se registran igual, como gap pendiente (`// GAP:` en proceso.js).
  Todo el que sí tenga el dato usa "Otro" para escribirlo — y como quien
  responde no siempre sabe qué formato esperas, el texto de la pregunta
  (no las opciones) debe incluir un ejemplo concreto de cómo escribirlo, con
  categorías y números de mentira: *"¿Cómo se reparten por años de
  experiencia? Escribe categoría y conteo, ej.: '0-3 años: 10, 3-8 años: 25,
  8+: 15'."*

#### A · Preguntas que SIEMPRE se hacen — sin default, ni corriendo sin preguntas

Nada de esto se infiere ni se rellena plausible. Si la respuesta no está,
detente y pregúntale a la consultora — aunque el resto del proceso corra en
piloto automático, estas tres no tienen modo silencioso:

1. **Universo de candidatos** (`contexto`) — el screening casi nunca es el
   universo completo (ver el detalle en el paso 3): nunca cuentes sus filas y
   las presentes como si lo fueran. Pregunta las cuatro cosas, en este orden,
   porque cada una alimenta un gráfico distinto:

   a. **Cuántos candidatos hubo en total** en el proceso (el número grande de
      la lámina 2).
   b. **De ese total, cuántos por HUNTING y cuántos por POSTULACIÓN.** Los dos
      números tienen que sumar el total de (a). Esta separación no es un
      detalle: es el gráfico completo de la lámina 2, y además define el
      recorte de la lámina 3 (que muestra **sólo** el grupo de hunting).
   c. Del grupo de **hunting**, cómo se reparten en las **tres dimensiones
      fijas** de la lámina 3: **años de experiencia**, **cargo actual** y
      **empresa actual**.

      **La cifra se pregunta abierta: nunca le propongas tramos ni categorías
      como opciones para marcar.** Es el error que hay que evitar: esos
      gráficos describen a TODO el grupo hunteado (que pueden ser 55
      personas), y de ellos la consultora tiene el dato porque lo saca a mano
      de LinkedIn cuando arma la búsqueda. El screening, en cambio, sólo cubre
      a los pocos que llegaron a llamada. Contar esas fichas y presentarlas
      como el perfil del grupo completo es inventar: dibuja a 55 personas con
      la forma de 9.

      Así que **no derives estos números del screening ni de los CV**.

      **Son tres preguntas de `AskUserQuestion`, no una** — una por
      dimensión (experiencia, cargo, empresa), cada una su propia tarjeta con
      las dos opciones terminales de arriba ("no lo sé" / "te confirmo
      después"). Nunca las fusiones en una sola pregunta ni las bajes a texto
      corrido — es justo el error a evitar: si ya usaste `AskUserQuestion`
      para la primera dimensión, las otras dos van del mismo modo, no como
      párrafo de seguimiento. Como sí caben las tres en una misma llamada
      (hasta 4 preguntas por llamada), mándalas juntas ahí, cada una como su
      propia tarjeta.

      Cada pregunta lleva su propio ejemplo de formato en el texto, con las
      categorías típicas de esa dimensión (mentira, sólo para mostrar el
      formato): experiencia → "0-3 años: 10, 3-8 años: 25, 8+: 15"; cargo →
      "Brand Manager: 20, Marketing Analyst: 15, Otros: 15"; empresa → nombra
      2-3 empresas de ejemplo + "Otros: N". El desglose real (categorías +
      conteo, 2-4 por dimensión) lo escribe libre en "Otro". Si los conteos
      que te dé no suman el total de hunting, respétalos igual: la diferencia
      son personas sin ese dato levantado y las columnas suman menos a
      propósito.

      Los valores por dimensión son 2–4 (tres slots de color), así que si te
      pasa una lista larga, pídele que agrupe la cola en "Otros" — pero es
      ella quien agrupa, no tú.
   d. Si de los de **postulación** existe algún reparto equivalente (normalmente
      no hay): si no lo hay, sus filas llevan **sólo `origen`** y está bien —
      las columnas de la lámina 3 hablan sólo del grupo hunteado.

   **Las personas del screening NO se marcan como hunting.** Quien llegó a una
   llamada pudo venir del aviso o del contacto directo: el screening no lo
   registra y no hay forma de saberlo. Etiquetarlas de hunting para poder
   graficarlas infla ese grupo con gente que quizás postuló sola. Por eso el
   contexto se puebla ENTERO con lo que entrega la consultora —el total, el
   reparto por origen y los tres repartos del grupo hunteado— y las filas del
   screening no entran ahí: alimentan las fichas de los candidatos, la
   comparativa y los insights, que es donde sí corresponden.

   **Las tres dimensiones de la lámina 3 no se negocian ni se cambian por lo
   que traiga el screening**: siempre experiencia, cargo y empresa. Si falta
   alguna, se deriva de los CV o se pregunta — no se sustituye por otra
   (edad, comuna, formación…).
2. **¿Se muestra la renta líquida actual de los candidatos, o solo la
   pretensión?** La pretensión **siempre** se presenta — eso no se pregunta.
   Lo que se pregunta es si además va la renta actual.
3. **Veredicto de renta** de la lámina de insights: pregúntale a la consultora cómo
   estaba el mercado en general para este cargo y propónle una respuesta con
   la evidencia que tengas, pero que sea ella quien la confirme o la ajuste.
   Ojo con el sesgo: quienes avanzaron a la longlist ya calzaban en renta —
   por eso los contactó — así que el screening por sí solo tiende a mostrar un
   mercado más barato de lo que es. Los descartados por renta alta no dejan
   rastro en los documentos, y esa es justo la información que el cliente
   necesita para saber qué pedía el mercado.

#### B · Preguntas de selección — propón opciones concretas, que ella marque

Arma tu propuesta como alternativas y pregúntale con una selección múltiple
(varias marcables a la vez) más la posibilidad de escribir algo distinto. No
decidas tú solo cuáles quedan — tu trabajo acá es proponer, no elegir.

4. **`requisitosCargo`** (2-8 pills del perfil): propón alternativas desde el
   descriptor y las columnas de criterios variables del screening; ella marca
   cuáles van.
5. **`comparativa.filasCriterios`** (2-4 criterios): son **dos preguntas, no
   una**. Primero cuáles van; después, **por cada criterio que haya marcado,
   CÓMO se responde**. Nunca elijas tú el formato de respuesta: es lo que
   define qué compara el cliente en la lámina donde decide.

   **Cómo armar las opciones de formato.** No ofrezcas "bool / tags / text" —
   esos son nombres del código. Ofrece respuestas concretas, ya redactadas con
   los datos de ESTE proceso:

   a. **Como respondió el screening.** Anda a esa columna y mira qué hay
      adentro. Si las celdas dicen "Sí" / "No tanto" / "poco", el formato
      natural es Sí/No. Si dicen "aceite, granos, maíz, arroz", son chips. Si
      dicen "7 años", "3 años", es texto corto. Cita valores reales de dos o
      tres candidatos en la descripción de la opción, para que ella vea cómo
      va a quedar la fila.
   b. **Lo que pide el descriptor.** Si el perfil pone un umbral ("3 años
      liderando", "presupuesto sobre $500M"), propón el formato que lo deja
      medir: el número o el monto, no un Sí/No que esconde la diferencia
      entre quien maneja $10M y quien maneja $2.000M.
   c. Una tercera si tiene sentido: agrupar en niveles ("Alto / Medio /
      Puntual") cuando el screening trae juicios en texto libre que no son ni
      binarios ni cuantificables.

   Ejemplo de cómo preguntar por "Manejo de presupuesto": *(1)* Sí/No —
   "responde si lo ha manejado, sin decir cuánto"; *(2)* el monto —
   "$500.000.000 anuales · US$2M · $80M por proyecto, como lo declaró cada
   uno"; *(3)* el tipo de presupuesto en chips — "Operacional · Inversión ·
   Marketing".

   El formato que elija fija el campo `tipo` (`bool` / `tags` / `text`) y,
   sobre todo, cómo se redacta el valor de cada candidato. **Ojo con la
   comparabilidad**: si los candidatos declararon el mismo dato en unidades
   distintas ("$600M anuales" vs "$5M por evento"), dilo en el `label` de la
   fila ("Escala de presupuesto") — una fila que parece ranking y no lo es
   engaña al cliente.
6. **`conclusion.motivosCaida`**: propón categorías desde las señales del
   screening (renta, distancia, perfil, título…); ella marca cuáles quedan.
7. **`conclusion.insights`**: mismo mecanismo — propón desde los datos, ella
   elige cuáles van.

#### C · El resto — proponer con default razonable si corre sin preguntar

8. **Fecha de presentación** (default: mes/año actuales).
9. **Tesis "en qué destaca"** de cada candidato — proponla desde el juicio
   del screening y pide confirmación.
10. Si el perfil trae instrucciones internas de renta ("mostrar hasta $X"),
    **qué cifra es presentable** al cliente.
11. Si hay **fotos** autorizadas para el deck (default: no, va el placeholder).

**Los próximos pasos NO se preguntan ni se escriben**: la lámina de cierre trae
el flujo estándar de Mandomedio (entrevista con el consultor → evaluación
psicolaboral → entrevista con el cliente) desde la plantilla.

Los puntos **A (1-3)** y **B (4-7)** no tienen modo silencioso: pregúntalos
siempre por `AskUserQuestion`, aunque el usuario haya pedido correr sin
preguntas — en A las opciones son sobre el formato de la respuesta (ver
"Mecánica de la pregunta"), en B son tu propuesta ya armada como opciones, no
hace falta que el usuario escriba de cero. Para el grupo **C (8-11)**, si
pidió correr sin preguntas, usa los defaults, marca cada gap con un
comentario `// GAP:` en proceso.js y lista los pendientes al entregar — si no
pidió correr sin preguntas, C también va por `AskUserQuestion` (default
propuesto como una opción más, junto a la alternativa de ajustarlo).

### 5 · Generar el deck

```bash
slug=<cargo-corto-empresa>        # ej: brand-manager-autosummit
mkdir -p decks
cp -R deck-template "decks/$slug"
```

Escribe `decks/<slug>/data/proceso.js` con tus datos (reemplaza completo el
ejemplo Ñuble). No toques nada más de la copia.

### 6 · Verificar antes de entregar

1. Lanza el agente **verificador-deck** (está en `.claude/agents/`) con la ruta
   del proceso.js generado y la carpeta del caso: cruza cada dato contra los
   documentos y escanea PII. Corrige lo que reporte.

2. **Verificación visual con Playwright** (herramientas MCP `browser_*` — si no
   las tienes cargadas en esta sesión, la conversación necesita reabrirse
   después de registrar el servidor; ver `claude mcp list`). No lo describas
   para que alguien más lo revise: ábrelo tú y mira de verdad.

   - Levanta un servidor local desde la raíz del proyecto:
     `python3 -m http.server 8000 &` (puerto libre cualquiera), y recuerda
     matarlo al terminar.
   - Navega a `http://localhost:8000/decks/<slug>/deck.html`.
   - Recorre TODAS las láminas mandando la tecla `→`, consumiendo todos los
     **pasos internos** antes de avanzar a la siguiente: `contexto` entra
     completa y no tiene pasos; `contexto-detalle` revela un gráfico por
     flecha (clickea una columna para probar que el filtro cruzado funciona);
     `insights` tiene 3; `perfil`, 8; `próximos pasos`, 3. Repite el recorrido completo en **los
     dos temas** (tecla `T` alterna). Toma una captura de cada lámina en cada
     paso relevante — no hace falta cada micro-paso, pero sí el estado final
     de cada una.
   - Abre el **currículum** de al menos un candidato (botón "Ver currículum" o
     `↓` sobre un perfil con `cv`): debe entrar con toda la información junta,
     sin pasos.
   - Después de cada carga, **lee los mensajes de consola** del navegador —
     cualquier error ahí (JS roto, `undefined`, excepción) es bloqueante,
     aunque la lámina se vea bien a simple vista.
   - Busca además, a ojo: textos cortados o desbordados, "undefined"/"NaN" en
     pantalla, montos sin formato, layouts rotos por listas largas, columnas
     del contexto que no cuadren con el screening. Si algo desborda, acorta el
     DATO (SCHEMA.md trae los límites) — nunca edites el HTML de la lámina.
   - Si corriges algo y vuelves a mirar, recarga forzado (el cache del
     navegador puede seguir sirviendo la versión vieja).
   - Guarda las capturas en el scratchpad, no en el repo del proyecto — son
     evidencia de esta verificación, no parte del deliverable.
   - Cierra el servidor local al terminar (`kill` del proceso que abriste).

   Esto se sirve por `http://` porque así funciona Playwright en este
   proyecto — pero "servido no es 100% equivalente" a cómo el cliente abre el
   deck de verdad (doble clic, `file://`), ver CLAUDE.md § reglas. Sirve para
   cazar la enorme mayoría de los bugs (datos, JS roto, layout); no reemplaza
   por completo abrirlo una vez con doble clic si algo huele a problema de
   origen entre el shell y una lámina (la modal del CV no abre, el filtro
   cruzado no responde).

3. Captura al menos portada, las dos de contexto, un perfil completo, el
   currículum abierto, comparativa y próximos pasos como evidencia.

### 7 · Entregar

Informa: ruta del deck (`decks/<slug>/deck.html` — se abre con doble clic),
gaps pendientes de la consultora si los hay, y el modo de uso: flechas ← →
avanzan (las láminas tienen pasos internos), en un perfil el botón
"Ver currículum" (o `↓`) abre el CV y `Esc`/`↑`/la × lo cierran sin perder el
lugar, `T` cambia tema claro/oscuro, `F` pantalla completa, y en la comparativa
se clickean hasta 3 candidatos para verlos lado a lado (`Esc` limpia).

## Reglas no negociables

- **PII fuera**: RUT, C.I., teléfonos, emails, direcciones y referencias no pasan
  al deck ni a los reportes. Las fotos sólo entran si la consultora las entrega
  para eso; nunca sacadas del CV. Los documentos del caso son evidencia cruda:
  nunca los edites ni los muevas.
- **No inventar**: dato que no está → se omite o se pregunta. Vale para un campo
  de un candidato y, sobre todo, para las filas del contexto. (El único deck con
  datos inventados es el mockup Ñuble de la plantilla.)
- Respeta los **límites por lámina** de SCHEMA.md: están calibrados al layout.
- Un deck por proceso en `decks/`; si se regenera, sobreescribe la misma
  carpeta (no acumules `-v2`).
- **Un deck ya generado es una FOTO de la plantilla en ese momento**: si
  `deck-template/` cambia después (una sesión de pulido, un ajuste de
  Vicente), los decks existentes quedan con `slides/`, `deck.html` y
  `assets/` desactualizados — mientras su `data/proceso.js` puede seguir
  usando el contrato nuevo, si alguien lo editó pensando en la plantilla
  actual. Esa mezcla (datos nuevos + lámina vieja) puede fallar en silencio
  (pantalla en blanco, sin ningún aviso en consola). Si vas a tocar un deck
  ya generado después de editar la plantilla, primero resincronízalo:
  `cp -R deck-template/{slides,deck.html,assets} decks/<slug>/` (deja
  `data/proceso.js` intacto).
- **Si alguna vez tocas una lámina** (no deberías — es trabajo sobre la plantilla
  maestra, no sobre un deck): sube la constante **`BUILD` de `deck.html`**, porque
  el shell carga cada lámina con `?b=<BUILD>` y sin subirla el navegador sigue
  sirviendo la versión vieja; y respeta el piso de **12 px** en todo texto
  visible, subiendo **el techo del `clamp()` junto con el piso** — el techo es el
  que deja el texto chico en pantalla grande.
