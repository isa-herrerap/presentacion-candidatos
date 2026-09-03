/* ============================================================================
   PROCESO — capa de información del deck de presentación de candidatos.

   Este es el ÚNICO archivo que cambia de un proceso a otro: las láminas
   (slides/*.html) son plantillas fijas que renderizan lo que hay acá.
   El esquema completo, campo por campo y con la fuente de cada dato,
   está en data/SCHEMA.md — léelo antes de editar esto.

   Reglas rápidas:
   - Montos SIEMPRE en pesos como entero (1550000, no "$1.55M"): las láminas
     los formatean solas ($1.550.000).
   - Los campos marcados [richtext] en SCHEMA.md aceptan SOLO <b>…</b> para
     destacar; nada más de HTML.
   - Este ejemplo (Gestor Social Ñuble) es 100% INVENTADO — es el mockup de
     referencia del template. No es un proceso real.
   ============================================================================ */
window.PROCESO = {

  meta: {
    cargo: "Gestor Social Regional de Ñuble",
    cargoAccent: "Ñuble",              // subcadena del cargo que va en naranjo
    empresa: "Fundación Cámara Chilena de la Construcción",
    empresaCorta: "Fundación CChC",    // para headers compactos (comparativa)
    fecha: "Julio 2026",
  },

  /* ---- Lámina CONTEXTO: categorías con distribución + número hero. ----
     `slot` asigna el color de la serie: c1 = naranjo (la categoría MAYOR),
     c2 / c3 = secundarios (se resuelven según el tema claro/oscuro).
     Los valores son conteos reales; el waffle los normaliza solo. */
  contexto: {
    // Título de la PRIMERA lámina de contexto (el universo completo).
    titulo: "Universo de candidatos", tituloAccent: "candidatos",
    caption: "Candidatos en el proceso",

    // La dimensión que va SOLA, grande y centrada, en la primera lámina, con
    // PORCENTAJES sobre las columnas en vez de conteos: ahí lo que importa es
    // el reparto (de dónde salieron), no la cifra exacta de cada barra.
    principal: "origen",

    // SEGUNDA lámina: todas las demás dimensiones, calculadas sólo sobre el
    // subconjunto que declara `filtro`. Existe porque la ficha completa
    // (experiencia, cargo, última empresa) sólo se tiene de los candidatos
    // contactados por hunting — de los que llegan por postulación no hay ese
    // dato, y sumarlos sobre los 245 sería inventar. Si un proceso SÍ tiene el
    // dato de todos, se borra `filtro` y la lámina cuenta sobre el universo.
    detalle: {
      titulo: "Perfil de los candidatos por hunting", tituloAccent: "hunting",
      caption: "Candidatos por hunting",
      filtro: { dim: "origen", valor: "Hunting" },
      nota: "Sólo el grupo de hunting: es del que se tiene ficha completa.",
    },

    // Las lecturas del universo. `id` es la llave que usa cada fila de
    // `candidatos`; `valores` fija el ORDEN en que se dibujan las columnas
    // (importante en tramos: 0-3 antes que 8+, aunque sea el más chico) y el
    // color de cada una (c1 naranjo = la serie principal).
    dimensiones: [
      { id: "origen", titulo: "Origen del candidato",
        valores: [ { nombre: "Postulaciones", slot: "c1" }, { nombre: "Hunting", slot: "c2" } ] },
      { id: "experiencia", titulo: "Experiencia en el cargo",
        valores: [ { nombre: "0-3 años", slot: "c3" }, { nombre: "3-8 años", slot: "c1" }, { nombre: "8+ años", slot: "c2" } ] },
      { id: "cargo", titulo: "Cargo actual",
        valores: [ { nombre: "Gestor Social", slot: "c1" }, { nombre: "Psicólogo", slot: "c2" }, { nombre: "Asistente Social", slot: "c3" } ] },
      { id: "empresa", titulo: "Última empresa",
        valores: [ { nombre: "Fundación CChC", slot: "c1" }, { nombre: "ONGs/Sector público", slot: "c2" }, { nombre: "Consultoras/Privado", slot: "c3" } ] },
    ],

    // UNA FILA POR CANDIDATO. Las láminas suman solas: de acá salen las
    // distribuciones Y el filtro cruzado (clickear una columna recalcula las
    // otras sobre ese subconjunto). Un campo AUSENTE = el screening no trae ese
    // dato: la fila no cuenta en ESA dimensión, pero sí en el total. Por eso
    // los 214 de postulación traen sólo `origen`.
    // Datos INVENTADOS: este es el mockup de la plantilla.
    candidatos: [
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "8+ años", cargo: "Psicólogo", empresa: "Fundación CChC" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Gestor Social", empresa: "ONGs/Sector público" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Gestor Social", empresa: "ONGs/Sector público" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "8+ años", cargo: "Psicólogo", empresa: "Fundación CChC" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "8+ años", cargo: "Asistente Social", empresa: "ONGs/Sector público" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "0-3 años", cargo: "Psicólogo", empresa: "Fundación CChC" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Asistente Social", empresa: "Consultoras/Privado" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "8+ años", cargo: "Psicólogo", empresa: "ONGs/Sector público" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "0-3 años", cargo: "Gestor Social", empresa: "ONGs/Sector público" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Psicólogo", empresa: "Fundación CChC" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Asistente Social", empresa: "Fundación CChC" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Gestor Social", empresa: "Fundación CChC" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "8+ años", cargo: "Gestor Social", empresa: "Fundación CChC" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "8+ años", cargo: "Asistente Social", empresa: "ONGs/Sector público" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Psicólogo", empresa: "Fundación CChC" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Gestor Social", empresa: "Consultoras/Privado" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "8+ años", cargo: "Psicólogo", empresa: "Fundación CChC" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "8+ años", cargo: "Gestor Social", empresa: "ONGs/Sector público" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Asistente Social", empresa: "ONGs/Sector público" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Asistente Social", empresa: "Consultoras/Privado" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "8+ años", cargo: "Psicólogo", empresa: "Consultoras/Privado" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Gestor Social", empresa: "Fundación CChC" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Asistente Social", empresa: "Consultoras/Privado" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "0-3 años", cargo: "Asistente Social", empresa: "ONGs/Sector público" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Psicólogo", empresa: "Fundación CChC" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "0-3 años", cargo: "Gestor Social", empresa: "Fundación CChC" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "0-3 años", cargo: "Gestor Social", empresa: "Fundación CChC" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Psicólogo", empresa: "Fundación CChC" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Asistente Social", empresa: "ONGs/Sector público" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "0-3 años", cargo: "Gestor Social", empresa: "Consultoras/Privado" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Hunting", experiencia: "3-8 años", cargo: "Gestor Social", empresa: "ONGs/Sector público" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
      { origen: "Postulaciones" },
    ],
  },

  /* ---- Requisitos del cargo: la lista de pills de la lámina de perfil.
     Es FIJA para todo el deck (no una por candidata): todos los perfiles
     muestran las mismas pills, en el mismo orden, y cada uno sólo dice
     cuáles cumple (ver `candidatos[].perfil.requisitos` más abajo). Elegir
     acá los requisitos VARIABLES del descriptor — lo transversal (título,
     comuna) ya vive en la ficha del rail. 2–8 en total, ideal 4-5. */
  requisitosCargo: [
    { key: "gestionProgramas", label: "Gestión de programas públicos" },
    { key: "equiposTerreno", label: "Equipos en terreno" },
    { key: "movilizacion", label: "Movilización propia" },
    { key: "indicadores", label: "Indicadores de gestión" },
    { key: "excel", label: "Excel" },
  ],

  /* ---- CANDIDATOS. ----
     Todos aparecen en portada, divisor y comparativa. Los que además traen
     `perfil` y `cv` generan sus dos láminas propias (perfil + CV). El orden
     acá es el orden de presentación. */
  candidatos: [
    {
      id: "ester",
      nombre: "Ester Ortiz Urra",
      pila: "Ester",                  // nombre corto para portada/divisor
      /* FOTO (OPCIONAL). Ruta relativa a deck-template/, igual que el resto
         de los assets del deck; la lámina de perfil le antepone "../" sola.
         Una URL absoluta o un data: también sirven.
             foto: "assets/fotos/ester.jpg",
         Mientras el campo no exista, el perfil dibuja el círculo IGUAL con
         las iniciales del candidato: el espacio de la foto está reservado en
         la composición y no depende de que haya imagen. Hoy va sin valor a
         propósito — todavía no se sabe de dónde salen las fotos. */
      edad: 39,
      comuna: "San Carlos",
      region: "Región de Ñuble",
      ubicacion: "San Carlos, región de Ñuble",   // línea de la ficha del perfil
      trabajando: true,               // false → el perfil marca "· último cargo"
      /* CARGO Y ORGANIZACIÓN — dos formas de cada uno, y cada lámina usa la suya:
           cargoActual  → el cargo COMO SE LLAMA, entero. Lo usa el PERFIL.
           cargoCorto   → la forma corta. La usa la COMPARATIVA.
           empresaActual / empresaActualLarga → mismo criterio (corta / completa).
         La comparativa muestra cinco candidatos en cinco columnas: el cargo
         largo de acá son cuatro o cinco líneas en esa columna y le revienta el
         alto a la fila. Por eso la forma corta es un CAMPO, no un recorte: un
         cargo cortado a la mitad con puntos suspensivos, en la lámina donde el
         cliente decide, es peor que un cargo bien resumido.
         Regla de dedo al escribirlos, medida sobre la lámina: `cargoCorto`
         hasta ~22 caracteres y `empresaActual` hasta ~26 entran en una línea
         aun en la pantalla más chica (1280×720). Más largo no se rompe nada,
         pero se parte en dos líneas y aprieta el alto de la fila. */
      /* Desde cuándo está en ESE cargo (no en la organización): sale de la
         entrada vigente de `cv.trayectoria`. Mes abreviado + año, o sólo el año
         si el CV no trae el mes. Si ya salió del cargo y se sabe hasta cuándo,
         se agrega `hasta` y la lámina pinta el tramo completo. */
      desde: "Ene 2024",
      cargoActual: "Encargada Territorial de Programa Prevención de las Violencias de Género",
      cargoCorto: "Encargada Territorial",
      empresaActual: "SernamEG",
      empresaActualLarga: "Servicio Nacional de la Mujer y Equidad de Género",
      rentaActual: 1550000,
      rentaPretension: 1800000,

      // estudios[0] es el título principal: es el que muestra la comparativa.
      // `validado:true` = verificado por Mandomedio; false = solo declarado.
      estudios: [
        { titulo: "Trabajo Social", institucion: "Universidad del Bío-Bío", validado: true },
        { titulo: "Diplomado en Gestión Pública Territorial", institucion: "Universidad de Chile", validado: false },
      ],

      // Valores de este candidato para las filas variables de la comparativa
      // (las keys deben calzar con comparativa.filasCriterios de más abajo).
      criterios: {
        movil: true,
        indic: true,
        herr: [{ t: "Excel" }],
      },

      perfil: {
        tesis: "La candidata con más <b>ejecución de programas sociales en terreno</b>; hoy hace en SernamEG casi el mismo cargo.",
        // Dos listas de texto plano, SIN etiqueta en el dato: los rótulos
        // ("Funciones principales" / "Logros") son fijos y los pone la lámina.
        // Antes cada proceso inventaba sus propios ejes y dos perfiles no se
        // podían comparar línea a línea. `funciones` = lo que hace hoy;
        // `logros` = lo que construyó o consiguió. Ambas admiten una o más
        // líneas, y `logros` puede ir vacío o ausente: hay candidatos sin
        // logros declarados y ese grupo simplemente no se dibuja.
        evidencia: {
          lead: "Lidera la <b>planificación, ejecución y control</b> de programas municipales de prevención y seguridad pública.",
          funciones: [
            "Diseñó el plan anual del programa en San Carlos: metas, presupuesto e hitos aprobados por el municipio.",
            "Implementa el plan en terreno junto a organizaciones de la sociedad civil, con equipos locales que ella misma capacita.",
          ],
          logros: [
            "Construye y monitorea los indicadores de gestión con que el programa reporta su avance al nivel central.",
          ],
        },
        // Un booleano por cada `key` de PROCESO.requisitosCargo (ver más abajo
        // en este archivo): true = cumple (pill pintada), false o key ausente
        // = no cumple (pill sin pintar). La lista de pills es la MISMA para
        // todas las candidatas del deck; acá sólo se dice cuáles cumple ÉSTA.
        requisitos: {
          gestionProgramas: true,
          equiposTerreno: true,
          movilizacion: false,
          indicadores: false,
          excel: false,
        },
        motivacion: "Quiere escalar a toda Ñuble lo que hoy ejecuta en una sola comuna, con <b>estabilidad de largo plazo</b>.",
        // `duracion` = cuánto duró en ESE cargo, escrita acá y no calculada por
        // la lámina. Se deriva del período de la entrada equivalente de
        // `cv.trayectoria` de este mismo candidato.
        // REGLA DE REDONDEO (la misma para todos los candidatos, si no las
        // filas no son comparables): meses transcurridos entre el mes de
        // inicio y el mes de término, SIN contar el mes de término
        // (Mar 2019 → Nov 2020 = 20 meses = "1 año 8 meses"). Se expresa en
        // años y meses; si no sobran meses va sólo el año ("3 años").
        // Si una salida no calza con ninguna entrada de la trayectoria, se
        // OMITE el campo — nunca se inventa una cifra; la lámina tolera la
        // ausencia y deja la fila sin metadato.
        salidas: [
          // Trayectoria: World Vision Chile, Mar 2019 — Nov 2020 → 20 meses.
          { org: "World Vision", duracion: "1 año 8 meses", motivo: "Finalización formal del proyecto territorial." },
          // Trayectoria: Quiero Mi Barrio (MINVU — Municipalidad de San Carlos),
          // Oct 2014 — Oct 2017 → 36 meses. El otro cargo municipal (SernamEG)
          // sigue vigente, así que no es una salida.
          { org: "Municipalidad de San Carlos", duracion: "3 años", motivo: "Fin de contratos por programas a plazo fijo." },
        ],
      },

      cv: {
        lede: "Ingeniera en Administración de Empresas · Magíster en Gerencia y Gestión Pública",
        formacion: [
          { grado: "Ingeniería en Administración de Empresas", institucion: "Universidad Andrés Bello" },
          { grado: "Magíster en Gerencia y Gestión Pública", institucion: "Universidad de Talca" },
          { grado: "Trabajadora Social", institucion: "Universidad del Bío-Bío" },
        ],
        pills: ["Español — nativo", "Inglés — básico", "Licencia clase B", "Microsoft Office", "Indicadores de gestión"],
        trayectoria: [
          {
            cargo: "Encargada Territorial · Prevención de las Violencias de Género",
            periodo: "Ene 2024 — Presente", duracion: "2 años 6 meses",
            org: "Servicio Nacional de la Mujer y Equidad de Género — Municipalidad de San Carlos",
            bullets: [
              "Administración, control operativo y supervisión de la ejecución del programa público.",
              "Coordinación interinstitucional para implementar acciones territoriales.",
            ],
          },
          {
            cargo: "Encargada de Proyectos",
            periodo: "Mar 2019 — Nov 2020", duracion: "1 año 8 meses",
            org: "World Vision Chile",
            bullets: [
              "Gestión y ejecución de proyectos con enfoque territorial.",
              "Coordinación de procesos de capacitación y ejecución programática.",
            ],
          },
          {
            cargo: "Encargada Plan de Gestión Social · Programa Quiero Mi Barrio",
            periodo: "Oct 2014 — Oct 2017", duracion: "3 años",
            org: "Ministerio de Vivienda y Urbanismo — Municipalidad de San Carlos",
            bullets: [
              "Administración del plan de gestión social del programa a nivel territorial.",
              "Supervisión de procesos participativos y coordinación institucional.",
            ],
          },
        ],
      },
    },

    /* Los otros cuatro finalistas del mockup solo tienen datos de comparativa
       (sin perfil/cv → no generan láminas propias). En un proceso real, la
       skill puebla perfil + cv para TODOS los presentados.
       `cargoCorto` + `empresaActual` son los dos campos que pinta la fila
       "Cargo actual" de la comparativa; `cargoActual` (la forma larga) va igual
       aunque acá no haya perfil, para que el par quede documentado. El estado
       del vínculo lo sigue diciendo `trabajando`: la lámina lo traduce a la
       pill "En ejercicio" / "Último cargo". */
    {
      id: "matias", nombre: "Matías Salas Pérez", pila: "Matías", edad: 27,
      comuna: "Cobquecura / Chillán", region: "Región de Ñuble",
      trabajando: false, rentaPretension: 1500000,
      cargoActual: "Trabajador Social del Programa Familias, Seguridades y Oportunidades",
      cargoCorto: "Trabajador Social", empresaActual: "Municipalidad de Quirihue",
      estudios: [{ titulo: "Trabajo Social", institucion: "Universidad del Bío-Bío", validado: true }],
      criterios: { movil: true, indic: true, herr: [{ t: "Excel" }, { t: "IA", hi: true }] },
    },
    {
      id: "macarena", nombre: "Macarena Berríos Muñoz", pila: "Macarena", edad: 46,
      comuna: "San Nicolás", region: "Región de Ñuble",
      trabajando: true, rentaPretension: 1500000,
      cargoActual: "Encargada de Proyectos de la Secretaría de Planificación",
      cargoCorto: "Encargada de Proyectos", empresaActual: "Municipalidad de Ñiquén",
      estudios: [{ titulo: "Diseño Industrial", institucion: "Universidad Diego Portales", validado: false }],
      criterios: { movil: true, indic: true, herr: [{ t: "Excel" }] },
    },
    {
      id: "debora", nombre: "Débora Velásquez Arroyo", pila: "Débora", edad: 34,
      comuna: "Yungay", region: "Región de Ñuble",
      trabajando: false, rentaPretension: 1500000,
      cargoActual: "Trabajadora Social del programa Servicio País",
      cargoCorto: "Trabajadora Social", empresaActual: "Servicio País",
      empresaActualLarga: "Fundación Superación de la Pobreza",
      estudios: [{ titulo: "Trabajo Social", institucion: "Instituto Profesional AIEP", validado: true }],
      criterios: { movil: true, indic: false, herr: [{ t: "Excel" }] },
    },
    {
      id: "javier", nombre: "Javier Garrido Muñoz", pila: "Javier", edad: 26,
      comuna: "Chillán", region: "Región de Ñuble",
      trabajando: true, rentaPretension: 1300000,
      cargoActual: "Analista de la División de Planificación y Desarrollo Regional",
      cargoCorto: "Analista de Estudios", empresaActual: "Gobierno Regional de Ñuble",
      estudios: [{ titulo: "Sociología", institucion: "Universidad Católica del Maule", validado: true }],
      criterios: { movil: true, indic: true, herr: [{ t: "Excel" }, { t: "ArcGIS", hi: true }, { t: "RStudio", hi: true }] },
    },
  ],

  /* ---- Lámina COMPARATIVA. ----
     Filas fijas (siempre): Estudios · Renta pretendida · Comuna · ¿Trabajando
     hoy? Después vienen las filas VARIABLES de este proceso, definidas acá.
     tipo: 'bool' → pill Sí/No · 'tags' → chips (hi:true las destaca en
     naranjo) · 'text' → texto corto (p.ej. nivel de Excel). */
  comparativa: {
    escalaMax: 2000000,          // techo común de las barras de renta
    filasCriterios: [
      { key: "movil", label: "Movilización propia", tipo: "bool" },
      { key: "indic", label: "Indicadores de gestión", tipo: "bool" },
      { key: "herr", label: "Herramientas", tipo: "tags" },
    ],
  },

  /* ---- Lámina INSIGHTS DE LA BÚSQUEDA (va antes de los candidatos). ----
     Casi todo esto es JUICIO DE LA CONSULTORA, no dato de documento: la skill
     lo propone desde el screening y lo confirma con quien llevó el proceso.
     La llave sigue llamándose `conclusion` por compatibilidad con los decks ya
     generados; la lámina que la dibuja es slides/insights.html.
     Los próximos pasos YA NO se declaran acá: son el estándar del proceso de
     Mandomedio y viven en slides/pasos.html (ver SCHEMA.md). */
  conclusion: {
    veredictos: [
      {
        label: "Renta", ok: true, estado: "Acorde a la posición",
        nota: "La banda de la Fundación ($1.500.000 líquidos) calza con la pretensión mediana de la terna. Sólo 1 de 5 finalistas queda sobre el techo.",
      },
      {
        label: "Funciones del cargo", ok: false, estado: "Requieren ajuste",
        nota: "El descriptor pide administración de recursos y presupuesto, pero el mercado regional concentra ejecución territorial. Conviene bajarle peso a esa función o considerar formación interna.",
      },
    ],
    motivosCaida: [
      "<b>Renta bajo la pretensión</b> declarada en el screening telefónico.",
      "<b>Sin continuidad</b> — el cargo se leyó como otro contrato a plazo fijo.",
      "Residencia <b>fuera de la región de Ñuble</b> y sin disposición a trasladarse.",
      "Título en <b>área distinta</b> a la solicitada en el descriptor.",
      "Sin <b>movilización propia</b> para cubrir terreno.",
    ],
    insights: [
      "<b>Mercado amplio en volumen, angosto en perfil:</b> 245 postulaciones, pero sólo 31 con ejecución territorial verificable.",
      "<b>La palanca de atracción es la estabilidad, no el sueldo.</b> 4 de 5 finalistas vienen de programas públicos a plazo fijo.",
      "Hay perfiles equivalentes en <b>municipios y ONGs de la zona</b>, hoy con baja competencia por ellos.",
    ],
    /* `pasos` NO se declara: la lámina de cierre trae el estándar de Mandomedio
       (entrevista con el consultor → evaluación psicolaboral → entrevista con
       el cliente). Sólo se escribe acá si un proceso puntual necesita otro
       flujo, con la forma [{titulo, detalle}] — ver SCHEMA.md. */
  },
};
