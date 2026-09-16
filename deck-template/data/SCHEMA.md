# SCHEMA — `data/proceso.js`

Contrato de datos del deck de presentación de candidatos. Las láminas
(`slides/*.html`) son plantillas fijas; **todo lo que cambia de un proceso a
otro vive en `window.PROCESO`**, definido en `data/proceso.js`. Para generar un
deck nuevo NO se tocan las láminas: se copia `deck-template/` y se reescribe
solo este archivo.

Convenciones de este documento:
- **Fuente** dice de dónde sale el dato en un caso real:
  `perfil` = docx del perfil de cargo · `screening` = xlsx de screening ·
  `cv` = PDF del candidato · `derivable` = se calcula/redacta desde documentos ·
  `consultora` = no está en los documentos, hay que preguntarlo.
- `[richtext]` = el string acepta **solo** `<b>…</b>` para destacar. Nada más
  de HTML en ningún campo.
- Montos SIEMPRE en pesos chilenos como entero (`1550000`). Las láminas
  formatean (`$1.550.000`).

Secuencia que genera este archivo: `portada · contexto · contexto-detalle ·
insights · divisor · perfil ×N · comparativa · próximos pasos`. Un candidato genera su lámina
de perfil **solo si trae el bloque `perfil`**, en el orden de `candidatos[]`. El
**currículum ya NO es una lámina de la secuencia**: se abre como modal encima
del perfil, desde el botón de esa lámina (o con ↓), y solo si el candidato trae
`cv` — no cuenta en el pager ni consume una diapositiva.

---

## `meta`

| Campo | Tipo | Oblig. | Fuente | Notas |
|---|---|---|---|---|
| `cargo` | string | ✔ | perfil → tabla "Antecedentes del cargo", fila "Nombre del cargo" | El nombre de archivo puede diferir del perfil (Besalco); manda el perfil. Si el perfil trae paréntesis internos ("(2 vacantes: …)"), el cargo va LIMPIO y la multi-vacante se explicita en `conclusion.insights` — el esquema no modela N vacantes a propósito: es un solo proceso, un solo deck. |
| `cargoAccent` | string | — | derivable | Subcadena del cargo que se pinta naranjo en la portada (elección editorial: la palabra más distintiva). Si no aparece literal dentro de `cargo`, se ignora sin romper nada. |
| `empresa` | string | ✔ | perfil → tabla "Datos de la empresa", fila "Empresa" | Ojo con inconsistencias perfil vs nombre del xlsx (Auto Summit vs One Summit): confirmar cuál se presenta. |
| `empresaCorta` | string | — | derivable | Para headers compactos (comparativa). Si falta, se usa `empresa`. |
| `fecha` | string | ✔ | **consultora** | "Julio 2026". No existe en los documentos (la fecha de levantamiento del perfil NO es la de presentación). Default: mes/año actuales. |

---

## `contexto` — el universo del proceso, en DOS láminas

Acá no se escriben distribuciones ya sumadas: se escribe **una fila por
candidato** y las láminas cuentan solas. Ese es el cambio que habilita el
**filtro cruzado** de la segunda lámina (clickear una columna recalcula las
otras sobre ese subconjunto): con distribuciones presumadas es imposible saber
cuántos de los 214 de "Postulaciones" tienen 8+ años de experiencia.

**La estructura es FIJA en todos los procesos** (ver el bloque ⚠️ más abajo):
lámina 2 = el universo completo repartido por `origen`; lámina 3 = sólo el
subgrupo de hunting, con tres gráficos siempre iguales (experiencia, cargo,
empresa). Lo único que cambia por proceso son los valores.

```js
contexto: {
  titulo, tituloAccent, caption,   // encabezado de la PRIMERA lámina
  principal: "origen",             // SIEMPRE "origen" — no es editorial
  detalle: {
    titulo, tituloAccent,
    filtro: { dim: "origen", valor: "Hunting" },   // SIEMPRE el recorte a hunting
  },
  // SIEMPRE estas cuatro, en este orden. Lo que varía son los `valores`.
  dimensiones: [
    { id: "origen",      titulo: "Origen del candidato", valores: [ {nombre:"Postulaciones", slot:"c1"}, {nombre:"Hunting", slot:"c2"} ] },
    { id: "experiencia", titulo: "Años de experiencia",  valores: [ … ] },
    { id: "cargo",       titulo: "Cargo actual",         valores: [ … ] },
    { id: "empresa",     titulo: "Empresa actual",       valores: [ … ] },
  ],
  candidatos: [ { origen: "…", experiencia: "…", … } ],   // UNA FILA POR PERSONA
}
```

### Encabezado de la primera lámina

| Campo | Tipo | Oblig. | Fuente | Notas |
|---|---|---|---|---|
| `titulo` / `tituloAccent` | string | ✔ / — | derivable | Título de la lámina del universo; accent = subcadena en naranjo. |
| `caption` | string | ✔ | derivable | Glosa bajo el número grande ("Candidatos en el proceso"). El número **no se escribe**: es `contexto.candidatos.length`. |
| `principal` | string (id) | ✔ | **consultora** | La dimensión que se muestra SOLA en la primera lámina, con **porcentajes** sobre las columnas en vez de conteos. **Es SIEMPRE `origen`** (postulación vs. hunting) — no es una elección editorial por proceso, es la única lectura que se tiene de TODO el universo. Si un proceso de verdad no distingue origen, pregunta antes de usar otra dimensión; no la cambies por tu cuenta. Si el id no existe, la lámina cae en `dimensiones[0]` antes que quedar en blanco. |

### `contexto.detalle` — la segunda lámina (el subconjunto)

| Campo | Tipo | Oblig. | Fuente | Notas |
|---|---|---|---|---|
| `titulo` / `tituloAccent` | string | ✔ / — | derivable | El título es el que declara el recorte ("Perfil de los candidatos por hunting"). Si falta, se usa `contexto.titulo`. |
| `filtro` | `{dim, valor}` | — | derivable | Subconjunto sobre el que se calcula TODO en esta lámina (conteos, escala de los ejes y número grande). **Sin `filtro`, la lámina cuenta sobre el universo entero** — que es lo correcto cuando el proceso sí tiene la ficha completa de todos. |
| `caption` | string | — | derivable | **Aceptado, hoy NO visible.** La lámina dejó de pintarlo. |
| `nota` | string | — | derivable | **Aceptado, hoy NO visible.** Se sacó del encabezado porque se leía recargado y el título ya dice de quiénes se habla. Si alguna vez vuelve, ojo con el alto del encabezado (afecta la medición del lienzo de los gráficos). |

La segunda lámina grafica **todas las dimensiones menos `principal` y menos la
del `filtro`**: dentro del subconjunto esa dimensión es constante, o sea un
gráfico que no dice nada.

### ⚠️ Las dos láminas de contexto tienen estructura FIJA — no es editorial

Este es el error más repetido al generar decks: cambiar qué se grafica según lo
que traiga cada screening. **No.** La estructura es siempre la misma, en todos
los procesos, y es lo que hace que dos decks de Mandomedio se lean igual:

- **Lámina 2 — el universo completo** (hunting + postulación juntos): un solo
  gráfico, la dimensión `origen`. Responde "de dónde salieron los candidatos".
- **Lámina 3 — sólo el subgrupo de HUNTING** (`detalle.filtro: {dim:"origen",
  valor:"Hunting"}`): tres gráficos, **siempre estos tres y en este orden**:
  1. **Años de experiencia** (`id: "experiencia"`)
  2. **Cargo actual** (`id: "cargo"`)
  3. **Empresa actual** (`id: "empresa"`)

O sea, `contexto.dimensiones` tiene **exactamente cuatro entradas**, siempre las
mismas: `origen`, `experiencia`, `cargo`, `empresa`. Lo que cambia por proceso
son los `valores[]` de cada una (los tramos de experiencia, qué cargos, qué
empresas), nunca *qué dimensiones existen*, y **no reemplaces ninguna por otra
dimensión** (edad, comuna, formación…) sólo porque ese dato sí está a mano.

**Los tres repartos de la lámina 3 se PREGUNTAN a la consultora, no se
calculan.** Ella los levanta a mano desde LinkedIn sobre todo el grupo
hunteado; el screening sólo cubre a quienes llegaron a llamada, que son muchos
menos. Contar esas fichas y presentarlas como el perfil del grupo completo
dibuja a 55 personas con la forma de 9.

Por qué la lámina 3 muestra sólo hunting y no todos: de los que llegan por
postulación normalmente no se tiene ficha (experiencia, cargo, empresa). Si se
graficaran los dos grupos juntos, las columnas mostrarían el perfil de un
subgrupo presentado como si fuera el de todo el universo. Por eso `filtro`
existe y por eso, en un proceso normal, **siempre apunta a Hunting**.

### `contexto.dimensiones[]`

Siempre las cuatro: `origen`, `experiencia`, `cargo`, `empresa` (ver el bloque
de arriba). Lo que se puebla por proceso son los `valores[]`.

| Campo | Tipo | Oblig. | Fuente | Notas |
|---|---|---|---|---|
| `id` | string | ✔ | **fijo** | La llave que usa cada fila de `contexto.candidatos`. Los cuatro ids son fijos: `origen`, `experiencia`, `cargo`, `empresa`. |
| `titulo` | string | ✔ | **fijo** | Encabezado de la card del gráfico. También estandarizado: "Origen del candidato", "Años de experiencia", "Cargo actual", "Empresa actual". |
| `valores[]` | 2–4 × `{nombre, slot}` | ✔ | derivable de screening | **Lo único que cambia por proceso.** El orden de este arreglo es el **orden de las columnas**: en tramos va 0-3 antes que 8+ aunque sea la más chica, porque el eje es una escala, no un ranking. `slot` fija el color: `c1` naranjo (la serie protagonista, normalmente la mayor), `c2` / `c3` secundarios. Solo hay tres slots; con cuatro valores, uno se repite. Para `origen` los valores son siempre "Postulaciones" y "Hunting". En `empresa`, prefiere el nombre de las empresas directo ("Carozzi, Ariztía, Agrosuper") en vez de envolverlo en una etiqueta de rubro genérica ("Sector Alimentos (Carozzi, Ariztía, Agrosuper)") — se lee más limpio y el rubro ya queda claro por los nombres. |

Los `nombre` tienen que ser **exactamente** los strings que aparecen en las
filas de `contexto.candidatos`: el conteo compara texto. Un valor que aparezca
en las filas y no esté en `valores[]` simplemente no se dibuja.

### `contexto.candidatos[]` — una fila por persona

Cada fila es un objeto `{ idDimensión: valorDeEsaDimensión }`. De acá salen
todas las cifras de las dos láminas.

**Un campo AUSENTE en una fila NO es un cero: es "el screening no trae ese
dato".** Esa fila no cuenta en esa dimensión, pero sí en el total, así que **las
columnas pueden sumar menos que el número grande, y está bien**. En el mockup
pasa a propósito: las 214 filas de postulación traen solo `origen`, porque la
ficha completa (experiencia, cargo, última empresa) se tiene únicamente de los
contactados por hunting. Sumarlas sobre los 245 sería inventar — para eso existe
la segunda lámina con su `filtro`. Consecuencia práctica: una fila sin el dato
tampoco pasa el filtro cruzado por esa dimensión, y es lo correcto.

**Los porcentajes no se escriben acá.** Los calcula la lámina, con reparto por
resto mayor (nada de columnas que suman 99% o 101%) y con el TOTAL como
denominador, no la suma de las columnas: si falta el dato de algunos, el reparto
suma menos de 100 a propósito.

**Filas fantasma:** una fila del screening que solo trae nombre y notas internas
(sin edad, cargo ni criterios levantados) no fue screening efectivo — exclúyela
del universo y de todos los conteos, y decláralo como GAP.

De dónde sale cada una de las CUATRO dimensiones fijas:

- **`origen`** (postulación vs. hunting) — **consultora**. El screening no lo
  registra: hay que preguntarlo, junto con el total del universo. Nunca se
  infiere contando filas del screening. Y ojo: **quien aparece en el screening
  pudo llegar por cualquiera de los dos caminos** —el aviso o el contacto
  directo—, así que esas filas tampoco se pueden marcar como hunting para
  poder graficarlas.
- **`experiencia`** (años), **`cargo`** (cargo actual) y **`empresa`** (empresa
  actual) — **consultora**, las tres. Son el retrato del grupo hunteado
  completo y ella lo levanta a mano desde LinkedIn al armar la búsqueda. Se
  preguntan ABIERTAS (categorías + conteo de cada una), sin ofrecerle tramos
  ni agrupaciones ya armadas: si el asistente las propone desde el screening,
  está describiendo a las pocas personas que llegaron a llamada y llamándolas
  "el grupo de hunting". Las columnas del screening con esos mismos nombres
  sirven para la ficha del candidato y la comparativa, **no** para esta lámina.

Con muchos valores distintos, agrupar la cola en un tercer valor ("Otros") —
son 2-4 columnas por gráfico, no una por cada valor único que aparezca.

Otras columnas del screening (edad, comuna, formación…) **no son dimensiones
del contexto**: por interesantes que parezcan, la estructura de las dos láminas
es fija (ver el bloque de arriba). Esos datos ya viven en la ficha del perfil y
en la comparativa.

---

## `candidatos[]` — orden = orden de presentación

Todos aparecen en portada, divisor y comparativa. Los que traen `perfil`
generan además su lámina propia; los que además traen `cv`, la modal del
currículum.

### Identidad y situación (fuente: screening, fila del candidato)

| Campo | Tipo | Oblig. | Fuente | Notas |
|---|---|---|---|---|
| `id` | string | ✔ | derivable | Slug único en minúsculas sin tildes (`ester`). Sirve para el deep-link `?sel=` de la comparativa. |
| `nombre` | string | ✔ | screening col `Nombre` | **LIMPIAR**: la celda trae RUT y notas de gestión ("(Chapi OK)", "REFERIDO", "CIERRE LISTO") que JAMÁS van al deck. Normalizar casing ("HARRY" → "Harry"). Además, **recortar a UN nombre + los dos apellidos** (3 palabras la mayoría de las veces): el screening suele traer el nombre legal completo con dos o más nombres de pila, pero el deck usa el nombre corto con el que la persona se presenta. Por defecto se deja SOLO el primer nombre de pila — el segundo se bota (no importa cómo firme su CV). La única excepción es un **nombre compuesto típico chileno**: dos nombres que van SIEMPRE juntos porque por separado quedarían incompletos o sonarían raro — el patrón clásico empieza con "María" (María José, María Paz, María Fernanda, María Ignacia…), "José" (José Miguel, José Manuel, José Antonio…), y de forma más acotada "Juan" (Juan Pablo, Juan Carlos), "Ana" (Ana María), "Luis" (Luis Alberto), "Rosa" (Rosa María). Nombres modernos o de origen no español (Camila, Daniela, Ayleen, Natalia…) casi nunca son compuestos aunque el screening o el CV los traiga con un segundo nombre pegado — ahí se bota igual. Los dos apellidos se mantienen siempre completos. |
| `pila` | string | ✔ | derivable | Nombre corto para portada/divisor — el nombre de pila ya recortado (uno solo, o el compuesto completo si aplica, ver fila `nombre`). Si hay dos iguales ("José Ignacio"/"Juan Ignacio"), desambiguar. El perfil parte el nombre en dos líneas solo si `pila` es el primer nombre de `nombre`; si no, muestra el nombre completo de corrido. |
| `foto` | string | — | **consultora** | Ruta relativa a `deck-template/` (`"assets/fotos/ester.jpg"`); el perfil le antepone `../` sola. Una URL absoluta o un `data:` también sirven. **Sin foto el círculo se dibuja igual, con las iniciales** (nombre + primer apellido, saltándose partículas): el espacio está reservado en la composición. Si la imagen no carga, cae al placeholder. Hoy ningún candidato del mockup la trae. |
| `edad` | number | ✔ | screening col `Edad` | El xlsx la entrega como float (39.0) → entero. |
| `comuna` | string | ✔ | screening col `Comuna` | Corregir typos evidentes ("San Bernanrdo"). Va como **pill en el encabezado de la columna** de la comparativa (no como fila): es dato de identificación, igual que el nombre y la edad. |
| `region` | string | — | derivable | **Solo se usa como respaldo**: el perfil arma su línea de ficha con `comuna, region` cuando no hay `ubicacion`. La comparativa NO la pinta — si los cinco candidatos son de la misma región, repetirla cinco veces no informa. |
| `ubicacion` | string | ✔ si hay perfil | derivable | Línea de la ficha del perfil: "San Carlos, región de Ñuble". |
| `trabajando` | bool | ✔ | screening col `Trab.` | No siempre es binaria ("Está haciendo un reemplazo") → interpretar. Las tres láminas hablan igual: el perfil rotula "· en ejercicio" / "· último cargo", la comparativa pone la pill "En ejercicio" / "Último cargo" y el CV marca así el empleo vigente. |
| `cargoActual` | string | ✔ si hay perfil | screening col `Cargo` | El cargo **como se llama, entero**. Lo usa el PERFIL. Puede venir vacía (Villarreal) → suplir con el CV. Si difiere del CV, manda el screening (más reciente). |
| `desde` | string | ✔ si hay perfil | cv (entrada vigente de la trayectoria) | Desde cuándo está en **ESE cargo**, no en la empresa (Fredy lleva desde 2023 en Empack, pero es Líder de Supply Chain desde Ene 2026: va Ene 2026). Formato `"May 2019"`, mes abreviado en español + año; **si el CV no trae el mes, va sólo el año** (`"2019"`). La lámina de perfil lo pinta bajo el cargo como "Desde may 2019". No lo calcula la lámina: se escribe acá, igual que `salidas[].duracion`. |
| `hasta` | string | — | cv | Sólo para `trabajando:false` **y** si se sabe cuándo terminó: la lámina pinta el tramo completo ("Jun 2025 — Mar 2026") en vez de un "Desde…" que haría pensar que sigue en el cargo. Mismo formato que `desde`. |
| `cargoCorto` | string | ✔ | derivable | La forma corta. La usa la **COMPARATIVA**. Es un campo y no un recorte automático a propósito: en una columna de cinco, el cargo largo son cuatro o cinco líneas que revientan el alto de la fila, pero un cargo cortado con puntos suspensivos —en la lámina donde el cliente decide— es peor que uno bien resumido. Hay fallback a `cargoActual` para no dejar la celda vacía; ahí la fila se estira. |
| `empresaActual` | string | ✔ si hay perfil | screening col `Empresa` | Forma corta / sigla. La pintan el perfil y la comparativa. Corregir typos ("CPMC" → CMPC, "Lucetti" → Lucchetti). |
| `empresaActualLarga` | string | — | derivable | Razón social completa si `empresaActual` es sigla. **Ya no se muestra en ninguna lámina** (el perfil dejó de pintar esa línea para no repetir la empresa que ya dice el kicker de arriba). Puedes seguir completándolo si lo tienes a mano, pero hoy no tiene efecto visual. |
| `rentaActual` | number | — | screening col `Observaciones` ("Renta líquida actual/última: …") | **Normalizar**: "2.7" = 2700000; "$1.5M" = 1500000. Puede no existir (candidato sin empleo) → omitir campo, el perfil muestra "—". |
| `rentaPretension` | number | ✔ | screening col `Pretensión de Renta` | Formatos mixtos: monto, rango, "Conversable", condiciones, "base + variable". Reglas: rango → punto BAJO; base+variable → la BASE fija; "Conversable" → el ancla si existe. El matiz no tiene dónde pintarse en la lámina: déjalo como comentario `//` junto al campo y, si afecta el veredicto de renta, en la nota de ese veredicto. |

**Largos, medidos sobre la lámina:** `cargoCorto` hasta ~22 caracteres y
`empresaActual` hasta ~26 entran en una línea aun en 1280×720. Más largo no
rompe nada, pero se parte en dos líneas y aprieta el alto de la fila.

### `estudios[]` (1–3; `estudios[0]` = título principal, es el que muestra la comparativa)

`estudios[0]` es siempre el TÍTULO de base (pregrado/técnico), aunque un
postgrado sea más pertinente al cargo — la comparativa compara títulos entre
candidatos y mezclar niveles la vuelve engañosa. Postgrados y diplomados van
como entradas siguientes; si el postgrado es lo relevante, destácalo en la tesis
del perfil.

| Campo | Tipo | Fuente | Notas |
|---|---|---|---|
| `titulo` / `institucion` | string | screening col `Título - Institución` + cv | El screening trae "Título - Institución" junto; separar. |
| `validado` | bool | screening col `Validación de titulo` | **Puede no existir la columna** (Auto Summit) o traer estados no binarios ("Solicitado", "pendiente") → `false` (declarado) y preguntar a la consultora. `true` SOLO con "validado" explícito. |

**El lenguaje de la validación tiene DOS estados y solo dos:** `true` →
"✓ Título validado", `false` → "Pendiente validación de título". No hay tercer
estado, ni notas al margen, ni íconos de alerta. El estado "pendiente" va sin
ícono porque describe algo que le falta a **Mandomedio** (verificar el
título), no una falta del candidato — el copy es explícito sobre qué está
pendiente (la validación) para que no se lea como que a la persona le falta
titularse. Por lo mismo se **eliminó el campo `nota`** de `estudios[]`: era la
puerta por la que volvía un tercer estado escrito a mano, y ninguna lámina lo
renderiza.

Este estado **sólo se muestra en el perfil individual** del candidato (la pill
junto a `estudios[0]`). La comparativa no lo muestra: ahí la celda "Estudios"
trae únicamente carrera + institución.

**`estudios[]` del perfil se cura por relevancia al cargo, no es el CV
completo.** Dos casos donde se omite una formación real aunque exista:

- **Un Técnico que el mismo título de Ingeniero/Licenciado ya deja atrás.**
  Si el candidato tiene Ingeniería/Licenciatura en la misma área y además un
  Técnico previo (el escalón natural de la carrera), el Técnico no suma en el
  perfil — se omite. El CV completo (`cv.formacion`) sí lo mantiene: ahí el
  detalle no estorba.
- **Formación real pero no acorde al cargo**, aunque sea interesante o
  diferenciadora (p.ej. un Profesor de Estado que hoy es Ingeniero en
  Logística). No la metas por "diferenciar" al candidato — si no aporta al
  cargo, no va en `estudios[]` del perfil.

### `criterios` (objeto `key → valor`)

Valores de este candidato para las filas variables de la comparativa (ver
`comparativa.filasCriterios`). `bool` → true/false · `tags` →
`[{t:"Excel"},{t:"IA",hi:true}]` (hi = destacado naranjo) · `text` → string
corto ("Avanzado"). Sin dato (key ausente) la celda muestra "—", que **no** es
lo mismo que "No".
Fuente: las **columnas de criterios variables del screening** (las que cambian
por proceso: para un contador F29/ciclo completo/ERP; para un brand manager
campañas/PPTO/industrias). Son texto libre → interpretar a Sí/No/tags.

### `perfil` (genera la lámina de perfil)

| Campo | Tipo | Oblig. | Fuente | Notas |
|---|---|---|---|---|
| `tesis` [richtext] | string | ✔ | **derivable + consultora** | "En qué destaca" en 1-2 frases. El screening trae el juicio crudo del consultor ("Buenísima, me encanta, al punto, se nota que sabe") — redactarlo en registro profesional y VALIDARLO con la consultora. A veces no existe (ni juicio) → preguntarlo. |
| `evidencia.lead` [richtext] | string | ✔ | derivable | Frase que encabeza la experiencia. |
| `evidencia.funciones[]` | 1–3 strings | ✔ | screening Observaciones (primero) + cv (para completar) | **Lo que hace hoy.** Texto plano, en lenguaje llano — no jerga técnica del CV. |
| `evidencia.logros[]` | 0–3 strings | — | screening Observaciones (primero) + cv (para completar) | **Lo que construyó o consiguió.** Texto plano, en lenguaje llano. Puede ir vacío o ausente: hay candidatos sin logros declarados y ese grupo simplemente no se dibuja (una etiqueta huérfana se leería como dato faltante). |
| `requisitos` | objeto `{key: bool}` | ✔ | screening criterios variables | Un booleano por cada `key` de `PROCESO.requisitosCargo` (ver abajo): `true` = cumple (pill pintada) · `false` o **key ausente** = no cumple (pill sin pintar). Nunca se asume `true` por omisión. |
| `motivacion` [richtext] | string | ✔ | screening Observaciones ("Motivación por el cargo/cambio: …") | Redactar en 1 frase. |
| `salidas[]` | 0–4 × `{org, motivo, duracion}` | — | screening Observaciones ("Salida de X: …", "Motivo de salida de X: …") | Últimas 1-2 empresas. Redactar el motivo con neutralidad — la clienta lo lee. **Candidato de una sola empresa** (primera y única pega, nunca ha salido de ninguna parte): se deja el arreglo VACÍO o se omite el campo, y la lámina pinta **"No aplica"** bajo el rótulo. No escribas esa frase a mano ni la disfraces de salida ("Sin salidas previas: …"): la respuesta la da la plantilla, igual en todos los decks. |

**Las etiquetas de la evidencia («Funciones principales» / «Logros») son
constantes de la plantilla, no dato.** Antes cada línea traía su propio `eje`
libre ("Municipios", "Terreno") y dos perfiles no se podían comparar línea a
línea, porque cada proceso inventaba sus categorías. Con rótulos fijos la
clienta lee el mismo par de preguntas — qué hace y qué consiguió — en todos.

**Por qué el screening manda sobre el CV en `funciones`/`logros`**: el CV no
es sólo la fuente, también puede quedar a la vista del cliente (se abre en la
modal del propio perfil), así que copiarlo tal cual duplica contenido y le
mete el tono técnico interno del CV a la lámina. El screening ya trae la
lectura que hizo la consultora de lo relevante. Recurre al CV sólo si el
screening viene pobre en ese candidato o falta un dato puntual — y aun así,
reescribe siempre en lenguaje llano, sin jerga ni siglas de industria sin
explicar.

**La misma prioridad (screening antes que CV) vale para `tesis`.** Al armar
"en qué destaca", apóyate primero en las Observaciones y el juicio de la
consultora — ahí suele haber logros y cifras concretas (volumen que movía,
tamaño del equipo, un sistema que implementó, una automatización que lideró)
que hacen la tesis más potente y la conectan con los requisitos de ESE cargo.
No hay una lista fija de qué cifra buscar — cambia según el cargo (toneladas o
camiones diarios en logística, cartera gestionada en ventas, dotación a cargo
en operaciones, etc.): la lectura del screening manda, no una categoría
predefinida. Esto pesa más para candidatos de empresas menos conocidas, donde
el cliente no tiene una referencia previa de en qué escala trabajaban; para
candidatos de marcas muy reconocidas (Carozzi, Colun, CCU) el cliente ya
asume el volumen, así que ahí es menos determinante.

**`PROCESO.requisitosCargo`** — la lista de pills de "Requisitos del cargo"
es FIJA para todo el deck, no por candidata: vive en un campo nuevo, a nivel
raíz de `PROCESO` (hermano de `meta`, `contexto`, `candidatos`), con la misma
forma que `comparativa.filasCriterios`:

```js
requisitosCargo: [
  { key: "seleccion", label: "Selección end-to-end" },
  { key: "formacionDO", label: "Formación y Desarrollo Organizacional" },
  // 2–8 en total. Elegir los requisitos VARIABLES del descriptor (lo
  // transversal — título, comuna — ya está en la ficha del rail).
],
```

Todas las candidatas muestran las MISMAS pills, en el mismo orden — eso es lo
que permite comparar de un vistazo entre perfiles, algo que el diseño
anterior (cada candidata con su propia lista de requisitos-que-cumple, con
etiquetas que no necesariamente calzaban entre sí) no dejaba hacer. Cada
`candidatos[].perfil.requisitos` sólo dice, por `key`, si ESA candidata lo
cumple; el texto del requisito (`label`) no se repite ahí.

**Ya no existe la distinción "verificado por Mandomedio vs. declarado"** que
tenía el diseño anterior (antes codificada en `ok:true/false`): hoy sólo hay
cumple/no cumple. Si se necesita esa distinción para algún proceso puntual,
consúltalo — no la reintroduzcas por tu cuenta cambiando el contrato.

**`salidas[].duracion` va SIEMPRE**, en todas las salidas de todos los
candidatos: es el string tipo `"1 año 8 meses"` a la derecha del motivo, y sin
él la fila queda coja justo donde el cliente compara permanencia. Que aparezca
en unos y en otros no se lee como "no se sabe", se lee como descuido.

Se escribe en los datos, no lo calcula la lámina, y se **deriva de
`cv.trayectoria` del propio candidato** cruzando por organización. Regla de
redondeo, la misma para todos (si no, las filas no son comparables): meses entre
el mes de inicio y el de término, **sin contar el mes de término** (Mar 2019 →
Nov 2020 = 20 meses = "1 año 8 meses"); si no sobran meses va solo el año
("3 años").

Cuando el CV no fecha bien el término (típico: cierra el empleo sólo con el
año), la duración se deriva del **inicio del empleo siguiente** — si entró al
siguiente en Mar 2023, ese cargo terminó en Feb 2023 — y se deja el porqué en un
comentario `//` al lado. Si ni así se puede calcular, se le pregunta a la
consultora: no se omite el campo y no se estima a ojo.

### `cv` (abre la modal del currículum, NO una lámina de la secuencia)

Se abre desde el botón de la lámina de perfil (o con ↓) y solo existe si este
bloque existe; sin él, el botón se saca del layout. Adentro se revela en **tres
pasos** con ←/→: trayectoria → formación → idiomas/licencias/herramientas. El
primero ya viene puesto al abrir (el cliente preguntó algo puntual, no
corresponde pedirle una tecla más para responder). Un bloque sin datos no genera
su paso, así que conviene que los tres vengan completos.

| Campo | Tipo | Oblig. | Fuente | Notas |
|---|---|---|---|---|
| `lede` | string | ✔ | cv (encabezado) | Títulos en una línea, separados por " · ". |
| `formacion[]` | 1–3 × `{grado, institucion}` | ✔ | cv | Si el CV es ambiguo, complementar con screening `Título - Institución`. |
| `pills[]` | 2–6 strings | ✔ | cv + screening | Idiomas, licencias, herramientas. **Cruces típicos**: la licencia de conducir casi nunca está en el CV — sale de la columna de movilización/licencia del screening. Idiomas faltan en muchos CV → omitir antes que inventar. Herramientas: si el CV lista 11 ERPs, seleccionar las 3-4 relevantes al cargo. |
| `trayectoria[]` | 2–8 × `{cargo, periodo, duracion, org, bullets[], queHace}` | ✔ | cv | 2 bullets por empleo, reescritos si el CV trae párrafos corridos. |
| `trayectoria[].queHace` | string | ✔ | **investigar** (no es dato del CV/screening) | **Va SIEMPRE, en TODA empresa de TODO candidato** — no es solo para las que la clienta "probablemente no conoce": el criterio de fama es subjetivo y termina dejando huecos. 1 frase MUY corta (6-13 palabras, sin subordinadas) de a qué se dedica esa empresa (p. ej. "Administradora de fondos de pensiones chilena"). Se pinta como tooltip al pasar el mouse sobre el nombre de la empresa en el CV. Es información PÚBLICA sobre la empresa (no del candidato) — se **investiga con búsqueda web**, y se usan las pistas que el propio CV ya da (rubro, marcas que menciona, ciudad, bullets de funciones) para confirmar que el resultado encontrado es ESA empresa y no una homónima. Si la búsqueda no encuentra nada confiable (agencias chicas, extranjeras, empresas ya cerradas), redacta la frase a partir de lo que el propio CV ya cuenta de ella en sus bullets — es preferible a un dato externo sin verificar. Sí puede omitirse si de verdad no hay ninguna pista utilizable (ni búsqueda ni bullets), pero eso debería ser la excepción, no la regla. |

**`trayectoria[].duracion` va SIEMPRE**, bajo el período de cada empleo
("3 años"). Mismo cálculo que `salidas[].duracion`: meses entre el mes de inicio
y el de término, sin contar el de término, y si no sobran meses va sólo el año.
Dos casos con regla propia:

- **Empleo vigente** ("— Presente"): se calcula hasta `meta.fecha`, la fecha de
  presentación del deck. No lo calcula la lámina a propósito — si lo hiciera, el
  mismo archivo mostraría un número distinto cada vez que se abre, y el deck es
  una foto del momento en que se presentó.
- **Período sin meses** ("2022 — 2025") o con el término sólo en año: no se
  puede calcular exacto, así que va **`"aprox. 3 años"`**. El "aprox." es parte
  del dato y se escribe explícito: mejor decir que es aproximado que fingir una
  precisión que el CV no da.

**El orden de `trayectoria` lo hace la plantilla**, así que quien puebla los
datos no tiene que preocuparse de él: la lámina ordena del más reciente al más
antiguo parseando la fecha de INICIO de `periodo` (el trozo antes del guion
largo). Las entradas sin fecha reconocible quedan al final, sin reordenarse
entre ellas. El recorte a 8 se aplica DESPUÉS de ordenar, o sea que lo que se
cae es lo más antiguo, y el bloque scrollea si no cabe.

Períodos: normalizar a "Mmm AAAA — Mmm AAAA"; solo años si el CV no trae meses;
si el CV no fecha el empleo en absoluto, `periodo: ""` (la lámina no pinta nada)
o descarta la entrada si hay mejores — jamás inventes fechas. **El empleo
vigente se detecta por el período**: si dice "Presente" (o "Actual", "a la
fecha", "hoy"), la lámina lo marca en acento y le pone el rótulo "En ejercicio"
o "Último cargo" según `trabajando`. Escribe "Presente" solo cuando de verdad
lo sea.

---

## `comparativa`

Filas **fijas** en todo proceso: Estudios · Renta pretendida · **Cargo actual**.
Después vienen las variables. Ya no hay fila "Comuna" (subió al encabezado de la
columna) ni "¿Trabajando hoy?": el dato que sirve para decidir no es si trabaja,
sino EN QUÉ, así que la fila "Cargo actual" muestra `cargoCorto` + la pill de
estado (En ejercicio / Último cargo, derivada de `trabajando`) + `empresaActual`.

| Campo | Tipo | Oblig. | Fuente | Notas |
|---|---|---|---|---|
| `escalaMax` | number | — | derivable | Techo común de las barras de renta: redondear hacia arriba la mayor pretensión (o el techo del rango ofrecido si es mayor). Si falta, la lámina usa la renta más alta redondeada al $100.000 hacia arriba. Una pretensión sobre el techo se dibuja llena, no desborda. |
| `filasCriterios[]` | 2–4 × `{key, label, tipo, sub?}` | ✔ | derivable (**editorial**) | `tipo`: `bool` / `tags` / `text`. `sub` es una bajada opcional del rótulo (aceptada; hoy nadie la usa). Elegir los 2-4 criterios MÁS discriminantes del proceso (donde los candidatos difieren), no los que todos cumplen. En filas `text`, cuida que los valores sean comparables entre candidatos: si las unidades difieren ("$600M anuales" vs "$5M por evento"), dilo en el label ("Escala de presupuesto") — una fila que parece ranking y no lo es engaña. |

## `conclusion` — la lámina de INSIGHTS, casi todo JUICIO DE LA CONSULTORA

La llave se llama `conclusion` por compatibilidad, pero la lámina que la dibuja
es **`slides/insights.html`** y ya no cierra el deck: va **antes** de los
candidatos (después del contexto, antes del divisor). Es el encuadre con el que
el cliente mira las fichas que vienen. La skill lo PROPONE desde los datos y lo
confirma con quien llevó el proceso.

| Campo | Tipo | Fuente | Notas |
|---|---|---|---|
| `veredictos[]` | exactamente 2 × `{label, ok, estado, nota}` [nota richtext] | **consultora** (evidencia derivable) | 1º: renta acorde (evidencia: pretensiones vs sueldo del perfil — ojo con instrucciones internas tipo "mostrar hasta $2.0M": preguntar qué cifra es presentable). 2º: funciones acorde al perfil levantado (evidencia: qué pide el descriptor vs qué trae el mercado según la long list). |
| `motivosCaida[]` | 3–5 strings [richtext] | derivable + consultora | Por qué se cayeron/descartaron candidatos. El screening trae señales crudas ("no me mató", "le falta power") — sistematizar en categorías presentables (renta, distancia, perfil, título). El "no avanza" muchas veces NO tiene porqué registrado → preguntar. |
| `insights[]` | 2–3 strings [richtext] | derivable + consultora | Lo que el cliente necesita saber del mercado: amplitud, dónde están hoy los candidatos, sensibilidades (renta, presencialidad, distancia), competencia por los perfiles. |
| `pasos[]` | 2–3 × `{titulo, detalle}` [detalle richtext] | — | **Normalmente NO se declara.** La lámina de cierre trae el estándar de Mandomedio, escrito en la plantilla. Sólo se escribe si un proceso puntual necesita otro flujo. |

**`conclusion.interes` ya no existe.** La columna "Qué busca quien sí está
interesado" se eliminó de la lámina: si una motivación importa, va en el
`perfil.motivacion` de ese candidato, que es donde el cliente la lee junto a la
persona. No la reintroduzcas.

---

## Lámina de cierre: `Próximos pasos`

Es la última del deck y **no se puebla desde los datos**: el flujo es el mismo
en todos los procesos de Mandomedio y vive en `slides/pasos.html`.

1. **Entrevista en profundidad** con el consultor a cargo.
2. **Evaluación psicolaboral** con psicóloga de Mandomedio.
3. **Entrevista con el cliente** para quienes avanzan (el nombre de la empresa
   sale de `meta.empresaCorta` / `meta.empresa`).

Un dato que nunca cambia sólo se puede escribir mal, por eso no está en
`proceso.js`. Si un proceso de verdad sigue otro camino, se sobrescribe con
`conclusion.pasos` (ver la tabla de arriba) y se conversa antes.

---

## Límites duros por lámina (no exceder — el layout está calibrado)

- `contexto.dimensiones`: 2–4 en total (una es la `principal`; las demás se
  reparten la segunda lámina: 3 caben en una fila, 4 pasan a 2×2, más se
  achican a 3 por fila). `valores` por dimensión: 2–4, y solo 3 slots de color.
  `contexto.candidatos` no tiene tope: son todos los del screening.
- `candidatos`: 3–6 (la comparativa se estrecha con más de 6; la portada
  auto-ajusta nombres hasta 8, y si no entran los parte en dos líneas).
- `estudios`: máx 3 · `perfil.evidencia.funciones` y `.logros`: máx 3 líneas
  **cada uno** · `requisitosCargo`: 2–8 (ideal 4-5) · `perfil.salidas`:
  máx 4 (ideal 2).
- `cv.formacion`: máx 3 · `cv.pills`: máx 6 · `cv.trayectoria`: máx 8 (de 4 en
  adelante el bloque pasa a modo compacto y scrollea).
- `conclusion.motivosCaida`: máx 5 · `insights`: 3 (no hay recorte en el
  código, manda el alto de la columna) · `pasos`: máx 3, y normalmente no se
  declara. Con sólo dos columnas cabe algo más de texto por ítem que antes,
  pero los topes de cantidad no cambian.
- Textos: `cargoCorto` ≤ ~22 caracteres · `empresaActual` ≤ ~26 · `tesis` ≤ 140 ·
  `motivacion` ≤ 120 · bullets ≤ 110 · notas de veredicto ≤ 220.

## Reglas de calidad al poblar (no negociables)

1. **PII fuera**: RUT, C.I., teléfonos, emails, direcciones particulares y
   referencias con contacto NUNCA pasan de los documentos al deck. La foto es la
   única excepción, y solo si viene autorizada y se declara en `foto`.
2. **Nada literal desde celdas sucias**: limpiar notas de gestión del nombre,
   corregir typos de empresas/instituciones, normalizar casing. El nombre
   además se recorta a UN nombre + dos apellidos, salvo nombre compuesto
   típico chileno (ver criterio en la fila `nombre` de la tabla de
   candidatos[] más arriba).
3. **Rentas normalizadas**: todo a entero en pesos. "2.7" y "2.9 líquido" son
   millones. En rangos, punto bajo. "Conversable" no es un número: usar el
   ancla si existe, si no omitir.
4. **No inventar**: si un dato no está (idiomas, renta actual, validación de
   título, la duración de una salida, la experiencia de quien llegó por
   postulación), se omite o se pregunta — jamás se rellena plausible. Un campo
   ausente es información: dice que no se sabe. La única excepción es un deck
   marcado explícitamente como mockup.
5. **Registro**: los juicios internos del consultor se reescriben en español
   profesional neutro. El deck lo lee el CLIENTE.
   - Tiempo verbal coherente con `trabajando`: si es `false`, la tesis, el lead
     y la evidencia van en PASADO ("Lideró…") — la lámina rotula "· último
     cargo" justo al lado y el presente chirría.
   - Tipografía fina: 360° lleva signo de grado (`°`), no el ordinal (`º`);
     los montos siempre con puntos de miles chilenos.
   - Un mismo nombre propio (empresa, universidad) se escribe IGUAL en todas
     sus apariciones dentro del deck — incluidos los `nombre` de
     `contexto.dimensiones[].valores` y las filas de `contexto.candidatos`, que
     se comparan como texto exacto.
6. **Lo que el perfil trae y NO va al deck**: contactos del cliente, grado de
   confidencialidad, tipo/condiciones de contrato (Art. 22, plazos de prueba),
   instrucciones internas de negociación ("mostrar hasta $X") y el nombre del
   consultor. Son material interno del proceso, no contenido de presentación.
