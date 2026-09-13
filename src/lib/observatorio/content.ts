export type NewsCategoryId = "institucional" | "doctrina" | "vuf" | "aula";

export type NewsPoint = {
  title: string;
  body: string;
};

export type NewsArticle = {
  id: string;
  category: NewsCategoryId;
  categoryLabel: string;
  date: string;
  dateShort: string;
  title: string;
  subtitle: string;
  lead?: string;
  pointsLabel?: string;
  points: NewsPoint[];
  eventDetailsLabel?: string;
  eventDetails?: NewsPoint[];
  cta?: string;
  href?: string;
  image?: {
    src: string;
    alt: string;
  };
};

export const OBSERVATORIO_HERO = {
  badge: "Órgano de difusión y doctrina técnica",
  title: "Noticias, análisis de coyuntura y reportes de avance",
  subtitle:
    "Especial PDUL Barquisimeto (2026–2046). Monitoreo técnico, impacto jurídico, ingeniería municipal y convocatorias formativas de Aula Ciudad.",
} as const;

export const LEAD_ARTICLE: NewsArticle = {
  id: "decreto-inicio-pdul",
  category: "institucional",
  categoryLabel: "Análisis Institucional",
  date: "11 de septiembre de 2026",
  dateShort: "11 Sep 2026",
  title:
    "Alcalde Yanis Agüero promulga el Decreto de Inicio del PDUL Iribarren: Análisis del marco de garantías para la inversión y el desarrollo social",
  subtitle:
    "El Decreto Municipal abre formalmente la hoja de ruta participativa que dotará a Barquisimeto de un plan ordenador a 20 años, superando una parálisis normativa de casi una década.",
  lead: "En un acto institucional que convoca a las cámaras empresariales, gremios técnicos, universidades y el Poder Popular, el Alcalde del Municipio Iribarren, Yanis Enrique Agüero, ha firmado y promulgado el Decreto de Inicio del procedimiento para la elaboración del nuevo Plan de Desarrollo Urbano Local (PDUL). Este acto administrativo activa las fases de diagnóstico, concertación social y formulación de la futura Ordenanza que regirá el crecimiento de Barquisimeto hasta el año 2046.",
  points: [
    {
      title: "Superación del Estancamiento Normativo",
      body: "El Decreto responde al deber legal de actualizar un plan cuya vigencia expiró originalmente en 2016, ordenando a la Dirección de Planificación y Control Urbano (DPCU) liderar las actuaciones técnicas.",
    },
    {
      title: "Tres Garantías Innegociables para la Ciudad",
      body: "El marco normativo promulgado establece que el plan no se redactará a puerta cerrada; se priorizará el rigor técnico y la seguridad jurídica como motor para reactivar la inversión privada, y se equilibrará el desarrollo del centro con la atención a las parroquias periféricas.",
    },
    {
      title: "Simplificación y Cero Papel (TrustTech)",
      body: 'Se instruye la digitalización de los procesos de recepción de propuestas y la aplicación del criterio "cero papel" e interoperabilidad en la sustanciación del expediente urbano.',
    },
  ],
  image: {
    src: "/brand/observatorio-lead.jpg",
    alt: "Vista aérea de Barquisimeto y el monumento Flor de Venezuela",
  },
};

export const SECONDARY_ARTICLES: NewsArticle[] = [
  {
    id: "sentencia-928-tsj",
    category: "doctrina",
    categoryLabel: "Doctrina Legal",
    date: "8 de septiembre de 2026",
    dateShort: "8 Sep 2026",
    title:
      "El impacto de la Sentencia 928 del TSJ y la superación definitiva del vacío normativo en Barquisimeto",
    subtitle:
      "Análisis doctrinario sobre la decisión de la Sala Constitucional que aplicó cautelarmente la ultractividad del plan de 2003 y fijó el mandato de dictar una nueva Ordenanza.",
    lead: "El andamiaje jurídico sobre el cual se levanta el nuevo PDUL Iribarren tiene un hito jurisprudencial insustituible: la Sentencia N° 928 dictada el 17 de diciembre de 2018 por la Sala Constitucional del Tribunal Supremo de Justicia (TSJ). En este fallo, el máximo tribunal constató la caducidad del plan promulgado en 2003 (cuyo artículo 150 fijó su vigencia hasta el 31 de diciembre de 2016) y ordenó su aplicación ultractiva para proteger a la ciudad de un colapso regulatorio.",
    points: [
      {
        title: "La Doctrina del Evitamiento del Caos Urbano",
        body: "La Sala Constitucional razonó que permitir la desaparición absoluta de las normas de zonificación, retiros y Variables Urbanas Fundamentales (VUF) paralizaría la administración municipal y generaría inseguridad jurídica sobre la propiedad privada.",
      },
      {
        title: "Carácter Cautelar y Transitorio de la Ultractividad",
        body: "La doctrina de AVIPRI enfatiza que la ultractividad otorgada por el TSJ es una medida de protección temporal y no una norma permanente; por lo tanto, subsiste la obligación jurídica del Municipio de discutir y sancionar una nueva Ordenanza.",
      },
      {
        title: "Camino Hacia la Certeza Plena",
        body: "El inicio del procedimiento actual da cumplimiento al espíritu de la Sentencia 928, abriendo el camino para sustituir una norma analógica obsoleta por una Ordenanza adaptada a la resiliencia y al desarrollo económico.",
      },
    ],
  },
  {
    id: "microzonificacion-sismica",
    category: "vuf",
    categoryLabel: "Retiros y VUF",
    date: "4 de septiembre de 2026",
    dateShort: "4 Sep 2026",
    title:
      "Microzonificación sísmica e ingeniería hídrica: Los pilares técnicos de la nueva zonificación de Barquisimeto",
    subtitle:
      "Cómo los estudios de geología, aceleración del suelo y drenajes pluviales reconfiguran el otorgamiento de permisos de construcción en la DPCU.",
    lead: "El urbanismo moderno no se diseña en un escritorio; se fundamenta en la ciencia de la tierra. La formulación del nuevo PDUL incorpora los estudios de microzonificación sísmica (FUNVISIS/COVENIN 1756) y la evaluación de cuencas hídricas como condicionantes directos de la edificabilidad y el régimen de las Variables Urbanas Fundamentales (VUF) en Iribarren.",
    points: [
      {
        title: "Sismorresistencia Aplicada a la Parcela",
        body: "Barquisimeto está categorizada en Zona Sísmica 5. La microzonificación permite identificar el comportamiento dinámico de los suelos, condicionando las alturas y la densidad en función de la capacidad de respuesta del terreno ante movimientos telúricos.",
      },
      {
        title: "Protección Marginal y Drenajes Pluviales",
        body: "La vulnerabilidad ante lluvias intensas en las cuencas del Río Turbio y la Quebrada La Ruezga exige fijar franjas de protección marginal (retiros de 25 a 50 metros) y exigencias de suelo permeable para evitar inundaciones urbanas.",
      },
      {
        title: "De Variables Estáticas a Variables Paramétricas (4D)",
        body: "La propuesta doctrinaria de AVIPRI busca evolucionar las VUF tradicionales (Arts. 86 y 87 LOOU) hacia un modelo dinámico donde la densidad y los retiros (amortiguación cinética) se ajusten a la capacidad real de los servicios y la seguridad estructural.",
      },
    ],
  },
  {
    id: "antifragilidad-aula-ciudad",
    category: "aula",
    categoryLabel: "Aula Ciudad",
    date: "12 de septiembre de 2026",
    dateShort: "12 Sep 2026",
    title:
      "Del Principio de Precaución a la Antifragilidad Legal en el Derecho Urbanístico",
    subtitle:
      "AVIPRI y Universitas Legal invitan a la videoconferencia magistral sobre el paso del urbanismo predictivo tradicional a un modelo de regulación adaptativa apoyado en Smart Cities y Gemelos Digitales.",
    pointsLabel: "Ejes Temáticos del Encuentro",
    points: [
      {
        title: "Límites de la Planificación Clásica",
        body: "Por qué los planes estáticos fallan ante imprevistos (Cisnes Negros) y por qué la resiliencia pasiva resulta insuficiente frente al desorden.",
      },
      {
        title: "Antifragilidad Legal",
        body: "El paso hacia un marco normativo que aprende de la volatilidad, manteniendo la precaución estricta en zonas de riesgo sísmico e hídrico y abriendo flexibilidad en el resto del tejido urbano.",
      },
      {
        title: "Smart Cities & Gemelos Digitales",
        body: "Cómo la Inteligencia Artificial y la simulación digital permiten testear las normas urbanas antes de su promulgación.",
      },
      {
        title: "Nuevas Herramientas",
        body: "Auditorías de fragilidad normativa, experimentación táctica (regulatory sandboxes) y normas dinámicas ajustadas a resultados reales (payoff).",
      },
    ],
    eventDetailsLabel: "Ficha del Evento",
    eventDetails: [
      {
        title: "Fecha y Hora",
        body: "Viernes, 09 de octubre de 2026 — 11:00 AM (VET).",
      },
      {
        title: "Ponentes",
        body: "Abog. Crismary Álvarez Pereira (AVIPRI) y Dr. Julio Pérez.",
      },
      {
        title: "Modalidad",
        body: "Transmisión Online (Acceso gratuito previa inscripción).",
      },
    ],
    cta: "Inscribirme a la Videoconferencia del 09 de Octubre",
    href: "https://universitas.myflodesk.com/antifragilidad-principio-normativo-derecho-urbanistico-global",
  },
];
