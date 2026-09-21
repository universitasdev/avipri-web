export const IUS_URBANO_URL = "https://iusurbano.universitas.legal";
export const IUS_URBANO_LOGIN_URL = "https://iusurbano.universitas.legal/login";
export const IUS_URBANO_REGISTER_URL =
  "https://iusurbano.universitas.legal/register";
export const WHATSAPP_URL =
  "https://wa.me/584145253310?text=" +
  encodeURIComponent(
    "Hola, quisiera solicitar asesoría técnica/legal especializada con el equipo de AVIPRI & Universitas Legal.",
  );
export const PARISHES = [
  "Catedral",
  "Concepción",
  "Santa Rosa",
  "Ana Soto (anteriormente Juan de Villegas)",
  "El Cují",
  "Tamaca",
  "Aguedo Felipe Alvarado",
  "Buena Vista",
  "Juárez",
] as const;

export const ORGANIZATION_TYPES = [
  "Cámara Empresarial",
  "Colegio Profesional / Gremio",
  "Universidad / Centro de Investigación",
  "Consejo Comunal / Comuna",
  "Comité de Tierras Urbanas (CTU)",
  "Asociación Civil / ONG / Fundación",
  "Empresa / Promotor Inmobiliario",
] as const;

export const INTEREST_AREAS = [
  "Zonificación, Alturas y Variables Urbanas Fundamentales (VUF)",
  "Seguridad Sísmica, Geología y Estructuras",
  "Vulnerabilidad Hídrica, Quebradas y Drenajes Pluviales",
  "Servicios Públicos (Agua Potable, Electricidad, Aseo Urbano)",
  "Movilidad, Vialidad y Transporte Público",
  "Desarrollo Comercial, Industrial y Actividades Mixtas",
  "Equipamiento Urbano, Parques y Áreas Verdes",
  "Regularización de Tierras y Asentamientos Populares",
] as const;

export const PARTICIPATION_MODES = [
  "Deseo recibir el Boletín Informativo y Noticias del PDUL (Vía Correo/WhatsApp)",
  "Deseo asistir a los Talleres Parroquiales y Asambleas de Vecinos",
  "Deseo participar en las Mesas Técnicas de Concertación (Exclusivo Gremios/Academia/Organizaciones)",
  "Deseo presentar observaciones formales durante la Consulta Pública (Art. 38 LOOU)",
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/abc-pdul", label: "ABC del PDUL" },
  { href: "/observatorio", label: "Observatorio y noticias" },
  { href: "/aula-ciudad", label: "Aula Ciudad" },
] as const;

export const SITE_SECTIONS = [
  { href: "/abc-pdul", title: "El ABC del PDUL", description: "Qué es el plan, sus componentes y el lenguaje urbanístico en palabras claras." },
  { href: "/ruta-legal", title: "Ruta legal y metodológica", description: "Las cuatro fases legales y la biblioteca de instrumentos de base." },
  { href: "/diagnostico", title: "Diagnóstico Iribarren 2046", description: "Movilidad, servicios, riesgos y morfología urbana." },
  { href: "/observatorio", title: "Observatorio y noticias", description: "Análisis de coyuntura, doctrina y boletines de Aula Ciudad." },
  { href: "/tramites", title: "Guía de trámites DPCU", description: "Consulta preliminar, certificaciones y habitabilidad en lenguaje sencillo." },
  { href: "/participacion", title: "Portal de participación", description: "Registro ciudadano, bitácora y formulario de observaciones." },
  { href: "/geoportal", title: "Geoportal y biblioteca", description: "Visor cartográfico ligero y acceso a IUS Urbano." },
] as const;
