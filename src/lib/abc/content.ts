export const ABC_NAV = [
  { href: "#fundamentos", label: "Fundamentos" },
  { href: "#triada", label: "Triada legal" },
  { href: "#procedimiento", label: "Procedimiento" },
  { href: "#estudios", label: "Estudios técnicos" },
  { href: "#mitos", label: "Mitos vs. realidades" },
  { href: "#faq", label: "Preguntas frecuentes" },
] as const;

export const BENEFITS = [
  {
    title: "Seguridad jurídica para la propiedad e inversión",
    body: "Protege el valor patrimonial de los inmuebles, elimina la discrecionalidad administrativa en el otorgamiento de permisos y reprime la especulación informal.",
  },
  {
    title: "Definición de reglas de juego claras",
    body: "Establece con precisión qué se puede construir, en dónde, con qué altura, densidad y usos de suelo (residencial, comercial, industrial o mixto).",
  },
  {
    title: "Planificación de servicios públicos y vialidad",
    body: "Condiciona el crecimiento urbano a la capacidad real de las redes de agua potable (Hidrolara), energía eléctrica (Corpoelec), drenajes pluviales y transporte colectivo.",
  },
  {
    title: "Equidad socio-espacial y calidad de vida",
    body: "Evita el colapso de las áreas consolidadas y garantiza equipamientos urbanos (escuelas, parques, centros de salud) tanto en el centro como en las parroquias periféricas (Guerrera Ana Soto, Tamaca, El Cují, Santa Rosa).",
  },
] as const;

export const LEGAL_HIERARCHY = [
  {
    title:
      "Constitución de la República Bolivariana de Venezuela (CRBV - Arts. 168 y 178)",
    body: "Consagra el gobierno local y otorga la competencia exclusiva e intangible a los municipios para regular la ordenación urbanística y el uso del suelo.",
  },
  {
    title:
      "Ley Orgánica de Ordenación Urbanística (LOOU, 1987 - Arts. 10 y 34)",
    body: "Delimita el contenido obligatorio del PDUL y la potestad del Concejo Municipal para sancionar mediante Ordenanza.",
  },
  {
    title: "Ley Orgánica del Poder Público Municipal (LOPPM, 2010 - Art. 54)",
    body: "Define a las Ordenanzas como leyes locales de aplicación general y obligatorio cumplimiento.",
  },
  {
    title: "Sentencia N° 928/2018 de la Sala Constitucional del TSJ",
    body: "Hito jurisprudencial que constató el vencimiento del plazo de vigencia del plan de 2003 (previsto en su artículo 150) y decretó cautelarmente su ultractividad para evitar que Barquisimeto quedara en un vacío normativo, ordenando a las autoridades municipales la formulación del nuevo texto legal.",
  },
  {
    title: "Guía Metodológica MINFRA (Resolución N° 139 / GO N° 37.888)",
    body: "Marco técnico oficial que fija las etapas de elaboración y la estructura exigida para el expediente urbano.",
  },
] as const;

export const TRIAD = [
  {
    number: "1",
    title: "El Plan propiamente dicho",
    subtitle: "Estrategia socio-espacial",
    body: "La memoria técnica, analítica y prospectiva que define el modelo de ciudad deseado a 20 años.",
    content:
      "Diagnóstico demográfico, delimitación de la poligonal urbana, clasificación del suelo, definición de áreas de expansión y estrategias de conservación ambiental.",
  },
  {
    number: "2",
    title: "La Ordenanza de zonificación",
    subtitle: "Instrumento coercitivo",
    body: "El cuerpo legal aprobado por el Concejo Municipal que traduce el plan en normas jurídicas de obligatorio cumplimiento para la administración y los ciudadanos.",
    content:
      "Delimita las zonas de la ciudad y fija las Variables Urbanas Fundamentales (VUF) parcela por parcela: usos permitidos (residencial, comercial, industrial), densidades de población, retiros legales de frente, lateral y fondo, porcentajes de ubicación/construcción y alturas máximas.",
  },
  {
    number: "3",
    title: "El Programa de Actuaciones Urbanas (PAU)",
    subtitle: "Plan de inversión e infraestructura",
    body: "El catálogo operativo que programa en el corto (1–3 años), mediano (4–10 años) y largo plazo (11–20 años) las obras e intervenciones públicas necesarias para viabilizar el desarrollo de la ciudad.",
    content:
      "Fichas de proyectos priorizados para ampliación de avenidas, construcción de colectores de cloacas, subestaciones eléctricas, parques y equipamientos educativos y asistenciales.",
  },
] as const;

export const PHASES = [
  {
    roman: "I",
    kicker: "Marco legal, diagnóstico urbano integral e indicadores",
    title: "Diagnóstico urbano integral",
    badge: "Meses 1 a 6",
    body: "Es la radiografía científica y jurídica de la ciudad. Antes de proponer nuevas normas, el equipo multidisciplinario evalúa el estado real del territorio, la infraestructura y el marco normativo.",
    items: [
      {
        title: "Auditoría legal e institucional",
        body: "Análisis del impacto de la Sentencia N° 928/2018 del TSJ (que ordenó la ultractividad del plan de 2003) y del Decreto Municipal de Inicio dictado por el Alcalde Yanis Agüero.",
      },
      {
        title: "Base cartográfica y catastro multifinalitario (WebGIS)",
        body: "Levantamiento vectorial georreferenciado de las 27.146 + hectáreas de la poligonal urbana y áreas de expansión.",
      },
      {
        title: "Evaluación de capacidad infraestructural",
        body: "Diagnóstico de la oferta real de agua potable (Hidrolara), energía eléctrica (Corpoelec), drenajes y vialidad.",
      },
      {
        title: "Estudios de vulnerabilidad y riesgos",
        body: "Mapeo de microzonificación sísmica, amenazas hídricas y conos de seguridad (como la Zona Protectora del Aeropuerto Jacinto Lara).",
      },
    ],
  },
  {
    roman: "II",
    kicker: "Prospectiva y concreción de la opción de desarrollo",
    title: "Opción de desarrollo (prospectiva)",
    badge: "Meses 7 a 12",
    body: "Es el debate técnico y social para definir el modelo de ciudad deseado para Barquisimeto hacia el año 2046 (imagen-objetivo).",
    items: [
      {
        title: "Pre-modelación de escenarios urbanos",
        body: "Análisis comparativo entre el escenario tendencial (crecimiento desordenado) y el escenario alternativo de sostenibilidad y densidad adaptativa.",
      },
      {
        title: "Mesas de concertación técnica",
        body: "Encuentros de co-diseño con el Registro de Organizaciones Intermedias (Universidad Centroccidental Lisandro Alvarado - UCLA, Colegio de Ingenieros - CIEL, Colegio de Arquitectos - CAEL, Cámaras de Comercio, Construcción e Inmobiliaria, y Comunas).",
      },
      {
        title: "Aprobación de la opción de desarrollo",
        body: "Documento estratégico que fija las directrices de crecimiento, conservación ambiental, corredores viales y centros de empleo parroquiales.",
      },
    ],
  },
  {
    roman: "III",
    kicker: "Construcción del plan, ordenanza y programa de actuaciones",
    title: "Construcción del plan",
    badge: "Meses 13 a 18",
    body: "Traducción de las estrategias en instrumentos jurídicos y cartográficos de obligatorio cumplimiento para la administración y los ciudadanos.",
    items: [
      {
        title: "Anteproyecto de Ordenanza de zonificación",
        body: "Redacción del articulado normativo que establece el régimen de las Variables Urbanas Fundamentales (VUF), retiros, alturas, usos mixtos y cronotopía urbana.",
      },
      {
        title: "Planimetría definitiva",
        body: "Juego de planos oficiales de zonificación, trama vial estructurante, redes de servicios y Zonas de Protección Urbana (ZPU).",
      },
      {
        title: "Programa de Actuaciones Urbanas (PAU)",
        body: "Fichas operativas que catalogan y priorizan las inversiones e intervenciones públicas y privadas a corto (1–3 años), mediano (4–10 años) y largo plazo (11–20 años).",
      },
    ],
  },
  {
    roman: "IV",
    kicker: "Tramitación legislativa, consulta pública y promulgación",
    title: "Fase legislativa y consulta pública",
    badge: "Meses 19 a 24",
    body: "Fase de validación democrática, control de legalidad y conversión del proyecto en Ordenanza sancionada y promulgada.",
    items: [
      {
        title: "Admisión e inicio de trámite legislativo",
        body: "Consignación formal del proyecto de Ordenanza ante el Concejo Municipal de Iribarren por parte del Alcalde (iniciativa legislativa exclusiva) para su primera discusión.",
      },
      {
        title: "Lapso legal de consulta pública reglamentaria (Art. 38 LOOU y Art. 140 LOAP)",
        body: "",
        nested: [
          {
            title: "60 días continuos de exhibición pública",
            body: "Apertura del período legal para que cualquier ciudadano, empresa o comunidad revise planos y borradores y presente alegatos u observaciones por escrito o vía web.",
          },
          {
            title: "30 días continuos de audiencias técnicas",
            body: "Sesiones de trabajo con las Organizaciones Intermedias inscritas en el Registro Oficial para fundamentar propuestas.",
          },
        ],
      },
      {
        title: "Procesamiento y matriz motivada de respuestas",
        body: "El equipo técnico evalúa cada alegato y emite un informe público y motivado aprobando o desestimando las observaciones (Art. 40 LOOU).",
      },
      {
        title: "Conformidad ministerial y discrepancias (Arts. 42 y 43 LOOU)",
        body: "Revisión de armonización técnica por parte del Ministerio rector (MPPVH/MINFRA). En caso de discrepancias, se activa una comisión ad hoc tripartita.",
      },
      {
        title: "Segunda discusión, sanción y promulgación",
        body: "Aprobación definitiva en Cámara Municipal, firma del Alcalde y publicación formal en Gaceta Municipal para su entrada en vigencia inmediata.",
      },
    ],
  },
] as const;

export const TRUSTTECH = {
  intro:
    "Para asegurar que la tramitación no sufra retardos injustificados ni distorsiones discrecionales, el procedimiento incorpora tres salvaguardas tecnológicas y administrativas:",
  items: [
    {
      title: "Comprobante digital e inalterable de observaciones",
      body: "Todo ciudadano o gremio que consigne una propuesta durante la Consulta Pública (vía web o presencial) recibe un acuse electrónico con número de folio unívoco y sello de tiempo, garantizando la intangibilidad de su expediente.",
    },
    {
      title: "Cero papel e interoperabilidad (DLSTA y LIG)",
      body: "Aplicación de los principios de simplificación de trámites para prohibir la exigencia de recaudos que ya cursen en archivos públicos y habilitar la consulta en formato digital abierto (Open Data / PDF con OCR).",
    },
    {
      title: "Respuesta motivada obligatoria",
      body: "Aunque las observaciones de la Consulta Pública no son vinculantes, la autoridad administrativa tiene la obligación legal (respaldada por la jurisprudencia de la Sala Político-Administrativa del TSJ) de motivar jurídicamente por qué acepta o desecha cada recomendación propuesta.",
    },
  ],
} as const;

export const STUDIES = [
  {
    title: "Microzonificación sísmica e ingeniería sismorresistente",
    challenge:
      "El Municipio Iribarren se encuentra ubicado en una zona de alta peligrosidad sísmica (Zona Sísmica 5 según la Norma COVENIN 1756 y FUNVISIS), influenciada por sistemas de fallas geotectónicas activas (como el sistema de fallas de Brollón / Boconó).",
    analyzes: [
      "La respuesta dinámica y la aceleración del terreno ante sismos en las distintas parroquias.",
      "Tipologías de suelo: identificación de áreas con riesgo de amplificación de ondas sísmicas, licuación de suelos o deslizamientos en laderas.",
    ],
    norms: [
      "Determina los límites máximos de altura y nivel de edificación por zona.",
      "Define los requisitos obligatorios de resistencia de materiales y métodos estructurales para otorgar la Constancia de Adecuación a las VUF.",
      "Restringe drásticamente la densidad residencial en suelos inestables o de alta amplificación.",
    ],
  },
  {
    title: "Vulnerabilidad hídrica, cuencas y drenajes pluviales",
    challenge:
      "Las precipitaciones intensas en las cuencas altas generan escorrentías que impactan la trama urbana a través de quebradas principales (como La Ruezga, Quebrada Seca y el gradiente del Río Turbio).",
    analyzes: [
      "Delimitación de cuencas hidrológicas urbanas y modelación del comportamiento de las lluvias para periodos de retorno de 25, 50 y 100 años.",
      "Mapeo de franjas de inundabilidad y capacidad de absorción del suelo frente a la impermeabilización generada por el concreto y el asfalto.",
    ],
    norms: [
      "Fija las franjas de protección marginal obligatorias (retiros de seguridad de 25 a 50 metros a ambos lados de los cauces, conforme a la Ley de Aguas y la LOOU).",
      "Exige porcentajes mínimos de área verde y suelo permeable dentro de cada parcela para mitigar la saturación de los colectores de lluvia.",
      "Prohíbe formalmente cualquier uso residencial o comercial en zonas catalogadas como de alto riesgo hídrico no mitigable.",
    ],
  },
  {
    title: "Capacidad instalada de redes de infraestructura y servicios públicos",
    challenge:
      "No se puede autorizar la construcción de un edificio o centro comercial si la red pública de agua potable o electricidad no tiene la capacidad de abastecerlo sin perjudicar a los vecinos del entorno.",
    analyzes: [
      "Evaluación del balance entre la oferta real instalada y la demanda proyectada a 20 años de los sistemas de agua potable y aguas servidas (Hidrolara), energía eléctrica (Corpoelec), drenajes profundos y disposición de desechos sólidos.",
      "Análisis de la presión hídrica y capacidad de carga de las subestaciones eléctricas por sector.",
    ],
    norms: [
      "Aplica el principio del Art. 84 de la LOOU: ningún permiso de construcción es válido sin la Certificación de Factibilidad Real de Servicios Públicos.",
      "Condiciona el aumento de densidad en corredores de densificación (ej. Av. Lara, Av. 20, Triángulo Este) a la previa ejecución de obras de ampliación de redes estipuladas en el Programa de Actuaciones Urbanas (PAU).",
    ],
  },
  {
    title:
      "Movilidad, vialidad, catastro multifinalitario y zonas de protección (ZPU)",
    challenge:
      "Garantizar la fluidez del tráfico, la conectividad entre parroquias y el respeto a servidumbres de seguridad e infraestructuras estratégicas.",
    analyzes: [
      "Capacidad de servicio de la red vial arterial, colectora y local frente a la generación de viajes por uso de suelo.",
      "Levantamiento del Catastro Multifinalitario (WebGIS): georreferenciación parcela por parcela de datos físicos, jurídicos, económicos y de riesgo.",
      "Mapeo de afectaciones especiales: cono de aproximación y servidumbres aeronáuticas del Aeropuerto Internacional Jacinto Lara, franjas de tuberías principales y corredores de alta tensión.",
    ],
    norms: [
      "Fija los retiros de frente viales para futuras ampliaciones de avenidas y trazado de vías de servicio.",
      "Establece la exigencia de puestos de estacionamiento y módulos de carga/descarga dentro de las parcelas comerciales e industriales para evitar el colapso de las vías públicas.",
      "Delimita las Zonas de Protección Urbana (ZPU) donde la edificabilidad está restringida por servidumbres públicas o ambientales.",
    ],
  },
] as const;

export const STUDY_MATRIX = [
  {
    study: "Microzonificación Sísmica",
    vuf: "Altura Máxima y Requisitos Estructurales",
    impact:
      "Define cuántos pisos puede construir y el nivel de refuerzo estructural exigido.",
  },
  {
    study: "Vulnerabilidad Hídrica",
    vuf: "Retiro de Cauce y Porcentaje de Ubicación",
    impact:
      "Determina la distancia obligatoria a quebradas y el área permeable de la parcela.",
  },
  {
    study: "Capacidad de Servicios",
    vuf: "Densidad de Población y Uso Permitido",
    impact:
      "Fija el número máximo de apartamentos o locales según la factibilidad de agua y luz.",
  },
  {
    study: "Estudio de Movilidad",
    vuf: "Retiro de Frente y Puestos de Estacionamiento",
    impact:
      "Garantiza el espacio para ampliación de vías y exige estacionamiento interno.",
  },
] as const;

export const MYTHS = [
  {
    topic: "Derecho de propiedad y régimen del suelo",
    myth: "El nuevo PDUL me va a quitar mi propiedad privada o va a decidir qué puedo hacer con mi casa sin mi consentimiento.",
    reality:
      "El PDUL no expropia ni vulnera la propiedad privada (protegida por el Art. 115 de la Constitución). Lo que hace es delimitar el contenido técnico del uso del suelo para garantizar la convivencia, la seguridad sísmica y el acceso a servicios. Un plan claro revaloriza tu inmueble y te otorga certeza jurídica, evitando que te construyan una industria ruidosa o un edificio que colapse tus tuberías al lado de tu vivienda.",
  },
  {
    topic: "Variables Urbanas Fundamentales (VUF)",
    myth: "Las Variables Urbanas Fundamentales (VUF) son burocracia inventada por los funcionarios de la DPCU para cobrar trámites.",
    reality:
      "Las VUF son las reglas técnicas mínimas de seguridad e higiene establecidas en los artículos 86 y 87 de la Ley Orgánica de Ordenación Urbanística (LOOU). Determinan el uso del suelo, la altura permitida, la densidad y los retiros (distancias obligatorias entre tu edificación y la acera o los linderos vecinos). Sin VUF, las edificaciones no tendrían ventilación, luz solar ni espacio para estacionar o ampliar las avenidas.",
  },
  {
    topic: "Afectaciones viales y reservas públicas",
    myth: "Si mi terreno tiene una “Afectación Vial” en el mapa del PDUL, la Alcaldía me lo quitó y ya no vale nada.",
    reality:
      "Una afectación vial es una reserva legal del suelo destinada al futuro trazado o ampliación de avenidas y servicios públicos. El terreno sigue siendo tuyo; no obstante, sobre la franja afectada no se permite construir obras permanentes. Si el Municipio ejecuta la avenida en el futuro, debe indemnizar justamente al propietario conforme a la Ley de Expropiación por Causa de Utilidad Pública. Mientras tanto, puedes usar esa franja como estacionamiento o área verde.",
  },
  {
    topic: "Sustitución de instrumentos obsoletos",
    myth: "El PDUL nuevo elimina de golpe todas las ordenanzas anteriores y deja sin validez las construcciones existentes.",
    reality:
      "El PDUL actualiza y armoniza las ordenanzas obsoletas (como el Plan de 2003 o las ordenanzas especiales del Triángulo Este y Centro Histórico) respetando los derechos adquiridos legítimamente. Si tu edificación fue construida legalmente con la norma anterior, conserva su plena validez. La nueva zonificación aplica para nuevas construcciones, ampliaciones o cambios de uso, adaptando a Barquisimeto a las demandas actuales de riesgo sísmico, agua y movilidad.",
  },
  {
    topic: "Consulta Pública de 60 días",
    myth: "Participar en la Consulta Pública no sirve de nada porque los gobiernos nunca toman en cuenta las observaciones de los ciudadanos.",
    reality:
      "La Consulta Pública de 60 días continuos (Art. 38 LOOU y Art. 140 LOAP) es un mecanismo legal obligatorio y auditable. Todas las observaciones consignadas por escrito o por la web generan un comprobante digital con número de folio inalterable. El equipo técnico está obligado por ley a responder cada alegato mediante una Matriz Motivada de Observaciones (Art. 40 LOOU). Si un reclamo técnico justificado es ignorado, el expediente puede ser impugnado jurídicamente.",
  },
  {
    topic: "Autonomía municipal en el uso del suelo",
    myth: "Un ministerio o decreto nacional puede cambiar la zonificación de una parcela en Barquisimeto sin pedirle permiso al Municipio.",
    reality:
      "Los artículos 168 y 178 de la Constitución y la LOPPM otorgan a los Municipios la competencia exclusiva e intangible para regular el uso del suelo urbano. Ningún organismo nacional o regional puede otorgar usos de suelo ni modificar la zonificación de Iribarren. Toda edificación o actividad económica debe someterse estrictamente a la Ordenanza de Zonificación dictada por el Concejo Municipal y tramitada ante la DPCU.",
  },
] as const;

export const DECALOGUE = [
  "El PDUL protege tu patrimonio y da valor a tu inmueble.",
  "La DPCU no inventa las VUF: aplica la ley aprobada por la comunidad.",
  "Tu participación en la Consulta Pública deja huella digital e irrefutable.",
  "El suelo de Barquisimeto lo decide Iribarren, con ciencia e ingeniería legal.",
] as const;

export const FAQS = [
  {
    question: "¿Cómo afecta la nueva zonificación a mi vivienda o negocio actual?",
    paragraphs: [
      "La nueva zonificación no afecta retroactivamente las construcciones o comercios que hayan sido establecidos legalmente bajo la normativa anterior, ya que el ordenamiento jurídico venezolano garantiza los derechos adquiridos.",
      "Sin embargo, si planeas ejecutar una nueva edificación, realizar una ampliación o cambiar el uso comercial de tu inmueble, deberás solicitar ante la Dirección de Planificación y Control Urbano (DPCU) la Constancia de Adecuación a las Variables Urbanas Fundamentales (VUF) conforme a los artículos 85 y 87 de la Ley Orgánica de Ordenación Urbanística (LOOU). La nueva zonificación establecerá con claridad los retiros obligatorios, alturas máximas y estacionamientos requeridos para proteger la convivencia y la capacidad de los servicios públicos en tu parroquia.",
    ],
  },
  {
    question: "¿Qué autoridad aprueba el plan? (DPCU vs. Concejo Municipal)",
    paragraphs: [
      "Existe una separación clara entre la función técnica/ejecutiva y la función legislativa:",
    ],
    bullets: [
      {
        title: "La DPCU y la Alcaldía",
        body: "Elaboran el diagnóstico, recopilan la información cartográfica, coordinan los estudios técnicos de base (sismos, agua, movilidad) y redactan el borrador del plan. El Alcalde ostenta la iniciativa legislativa exclusiva para presentar el proyecto.",
      },
      {
        title: "El Concejo Municipal",
        body: "Es el único órgano con competencia constitucional (Art. 178 CRBV) y legal (LOPPM y LOOU) para admitir, someter a Consulta Pública de 60 días, debatir y sancionar mediante Ordenanza el PDUL. La DPCU no aprueba leyes; la DPCU las administra y fiscaliza una vez promulgadas.",
      },
    ],
  },
  {
    question:
      "¿Qué validez legal tienen mis comentarios formulados durante la Consulta Pública?",
    paragraphs: [
      "De acuerdo con los artículos 38 y 40 de la LOOU, las observaciones formuladas por los ciudadanos durante los 60 días continuos de Consulta Pública y los 30 días de audiencias técnicas no tienen carácter vinculante obligatorio para la autoridad urbanística.",
      "Sin embargo, la Ley Orgánica de la Administración Pública (LOAP) y la jurisprudencia del TSJ obligan al equipo técnico a evaluar cada alegato y publicar una Matriz Motivada de Respuestas. Si tu observación demuestra tacha de ilegalidad, violaciones a la seguridad sísmica o errores en la cartografía catastral, la autoridad debe corregir el borrador. Además, cada entrega genera un comprobante digital con código único de seguimiento para garantizar el derecho constitucional de petición.",
    ],
  },
  {
    question: "¿Qué puedo hacer si la DPCU niega o no responde mi trámite urbanístico?",
    paragraphs: [
      "Si la DPCU resuelve que tu proyecto no se adecúa a las VUF o niega una consulta, la LOOU establece en sus artículos 83 y 89 los recursos administrativos de ley:",
    ],
    bullets: [
      {
        title: "Recurso de Reconsideración",
        body: "Interpuesto ante el mismo órgano que dictó el acto dentro de los 30 días siguientes.",
      },
      {
        title: "Recurso Jerárquico",
        body: "Si la reconsideración es negativa, se apela ante el Concejo Municipal.",
      },
      {
        title: "Vía Contencioso-Administrativa",
        body: "Agotada la vía municipal, el ciudadano puede acudir a los tribunales de la Jurisdicción Contencioso-Administrativa para defender su derecho.",
      },
    ],
  },
] as const;

export const VIDEOS = [
  {
    id: "i39jb9-DDPA",
    badge: "Aula Ciudad",
    title: "Deuda legislativa urbanística en Venezuela",
    body: "El Dr. Carlos García Soto analiza la obsolescencia de las leyes urbanísticas, la inseguridad jurídica y la urgencia de fortalecer la autonomía municipal.",
    href: "https://www.youtube.com/watch?v=i39jb9-DDPA",
  },
  {
    id: "hUwOD71YT2w",
    badge: "Aula Ciudad",
    title: "Responsabilidad de las autoridades urbanísticas",
    body: "El Dr. Emilio Urbina Mendoza explica la responsabilidad civil, administrativa y penal de las autoridades ante catástrofes y la falta de actualización de los planes.",
    href: "https://www.youtube.com/watch?v=hUwOD71YT2w",
  },
  {
    id: "awIfu2U_TMQ",
    badge: "Aula Ciudad",
    title: "El derecho urbanístico en Venezuela, cuatro décadas después",
    body: "Videoconferencia sobre el desmantelamiento de la planificación urbana, la mitigación de riesgos y la necesidad de reconstruir la capacidad técnica del Estado.",
    href: "https://www.youtube.com/watch?v=awIfu2U_TMQ",
  },
] as const;
