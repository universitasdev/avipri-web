# PEDUL Online — Contexto del proyecto y plan de trabajo

Documento de alineación técnica a partir del estado del repositorio `avipri-web`, los repos hermanos (PEDUL YA) y la minuta de reajustes previa a la presentación en Caracas.

---

## 1. Resumen ejecutivo

**PEDUL Online** (`avipri-web`) es el portal informativo y de participación del consorcio **AVIPRI & Universitas Legal** para el Plan de Desarrollo Urbano Local del Municipio Iribarren. Su rol estratégico: funcionar como **vitrina técnica e interactiva** de los servicios del consorcio, documentar el proceso de Barquisimeto y atraer a otras alcaldías.

Convive con **PEDUL YA** (`portal-iribarren` + `plataforma-admin`), el portal oficial de la Alcaldía. No son el mismo producto: YA es municipal/participativo; Online es marca consorcio + observatorio + CMS propio.

**Objetivo inmediato:** adecuar Online (diseño de noticias, galerías, PDF, admin flexible) tomando como referencia el módulo ya construido en PEDUL YA, manteniendo identidad visual y stack de Online, de cara a la presentación del **jueves en Caracas**.

---

## 2. Repositorios involucrados

| Ruta local | Nombre | Rol |
|---|---|---|
| `web avipri pdul/avipri-web` | **PEDUL Online** | Portal público + panel admin propios (este repo) |
| `portal-iribarren` | **PEDUL YA** (portal) | Portal ciudadano de la Alcaldía; módulo de noticias maduro |
| `plataforma-admin` | **PEDUL YA** (admin) | CMS editorial TipTap, 5 formatos, PDF, galería, video |

Remoto Online: `https://github.com/universitasdev/avipri-web.git`  
Deploy: **Netlify** (plugin Next.js + Cloud SQL Connector).

---

## 3. Qué es PEDUL Online hoy

### 3.1 Propósito y audiencia

- Ciudadanos, gremios, academia y alcaldías interesadas en el modelo PDUL.
- Contenido editorial (Observatorio), formación (Aula Ciudad / ABC del PDUL), termómetro de avance, CTAs a IUS Urbano y WhatsApp de asesoría.
- Dominio de referencia en metadata: `pdul.online`.

### 3.2 Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| UI | Tailwind CSS 4, Font Awesome, componentes admin (Radix/CVA) |
| Validación | Zod 4, React Hook Form |
| Base de datos | PostgreSQL + Prisma 6 |
| Conexión prod | `@google-cloud/cloud-sql-connector` + `pg` adapter |
| Archivos | Google Cloud Storage (`@google-cloud/storage`) |
| Auth admin | JWT (jose) + refresh tokens + bcrypt + rate limit |
| Extra | YouTube API (Aula Ciudad), Netlify |

### 3.3 Estructura de la aplicación

```
src/app/(site)/     → Sitio público (layout SiteShell)
src/app/admin/      → Panel editorial (login + panel protegido)
src/app/api/admin/  → API REST del CMS
src/lib/            → auth, db, observatorio, storage, thermometer, youtube
prisma/             → schema, migraciones, seed
```

### 3.4 Rutas públicas

| Ruta | Estado |
|---|---|
| `/` | Activa (hero, termómetro, impacto, IUS Urbano) |
| `/abc-pdul` | Activa (contenido editorial ABC) |
| `/observatorio` | Activa (noticias desde DB con fallback estático) |
| `/aula-ciudad` | Activa (videos) |
| `/ruta-legal` | Placeholder |
| `/diagnostico` | Placeholder |
| `/tramites` | Placeholder |
| `/participacion` | Placeholder |
| `/geoportal` | Placeholder |

Navegación principal: Inicio · ABC del PDUL · Observatorio · Aula Ciudad.

### 3.5 Panel administrativo (`/admin`)

- Login: `/admin/login`
- Módulos: **Noticias**, **Termómetro**, **Videos**
- Auth por cookies (access + refresh); varias sesiones posibles si existen varios `User` en DB
- Subida de imágenes a GCS (hoy: **una** imagen por noticia)

### 3.6 Modelo de datos (Prisma)

- `User`, `RefreshToken`, `LoginAttempt`
- `NewsArticle` — campos rígidos: category, title, subtitle, lead, pointsJson, eventDetailsJson, cta, href, **imageSrc** (única), featured, published
- `Video` — Aula Ciudad (YouTube)
- `Thermometer` — fase activa del proceso

### 3.7 Variables de entorno (ver `.env.example`)

`DATABASE_URL`, `INSTANCE_CONNECTION_NAME`, `AUTH_SECRET`, `AUTH_REFRESH_SECRET`, `ADMIN_*`, `YOUTUBE_API_KEY`, `PLAYLIST_ID`, `GCS_*`.

### 3.8 Fortalezas actuales

- CMS propio ya desplegable en Netlify + Cloud SQL + GCS
- Observatorio y Aula Ciudad conectados a datos
- Identidad de marca Online definida
- Auth multi-sesión viable (concurrencia básica)

### 3.9 Limitaciones actuales (dolor de la minuta)

- Una sola foto por noticia; distorsión de destacada según contenedor
- Sin galería, sin PDF, sin cuerpo HTML rico (TipTap)
- Formulario admin rígido (points/eventDetails) frente al editor de YA
- Listado Observatorio no homologado al mosaico/detalle de YA
- Sin repositorio documental tipo “cuadernillos / decretos” aparte

---

## 4. Qué tiene PEDUL YA (referencia a replicar)

### 4.1 Portal (`portal-iribarren`)

- Listado mosaico de noticias + detalle `/noticias/[slug]`
- Componentes: galería asimétrica + lightbox, visor PDF, video, puntos de análisis, botón externo
- Cinco formatos de publicación: **TEXTO | IMAGEN | GALERIA | DOCUMENTO | VIDEO**
- Repositorio de documentos (versiones, categorías, oficial/borrador)

### 4.2 Admin (`plataforma-admin`)

- Editor TipTap (HTML saneado)
- Campos de medios: portada recortada, galería N fotos, PDF, video (archivo / YouTube / Instagram)
- Autoguardado de borradores, estados (borrador / programado / publicado), vista previa
- Categorías alineadas a Propuesta v4 (Análisis institucional, Doctrina legal, Decretos, etc.)

### 4.3 Relación con Online

**No** se debe fusionar Online con el admin multi-alcaldía de YA ni depender aún de `plataforma-api` (NestJS).

**Sí** se debe **adaptar el módulo de noticias** (modelo + UI pública + UX de carga) de YA hacia Online, preservando marca, auth y deploy de Online.

---

## 5. Minuta: requerimientos solicitados

Fuente: coordinación técnica previa al evento de Caracas (jueves).

### 5.1 Noticias y diagramación

1. Homologar diagramación/versatilidad de noticias de **PEDUL YA**, con colores/identidad de **PEDUL Online**.
2. Galería: mínimo 2–3 fotos por noticia; corregir proporción de la imagen destacada.
3. Actualizar contenidos (títulos, fotos de reuniones/equipo) — a cargo de editorial cuando la plataforma esté lista.

### 5.2 Documentos PDF

4. Visor o descarga de PDF (decretos, estudios).
5. Cuadernillos UCAT: reseña + PDF descargable/visualizable.

### 5.3 Redirección externa

6. Reseñas de artículos bajo derechos (ej. RDU): portada + breve texto + enlace a la revista.

### 5.4 Panel admin

7. Menos rigidez al redactar y subir contenido.
8. Evaluar acceso concurrente de varios usuarios para carga masiva.

### 5.5 Acuerdos operativos

- Editorial prepara textos, fotos y PDFs en local para cargar lunes–martes.
- Desarrollo evalúa duplicar/adaptar el módulo de noticias de YA.
- Prioridades a alinear con el Dr. Julio (tres proyectos en paralelo: YA, Online, jueces).

### 5.6 Cronograma

| Hito | Plazo |
|---|---|
| Alineación técnica | Viernes (mañana) |
| Carga de contenidos | Lunes–martes |
| Plataforma lista | Miércoles |
| Presentación Caracas | Jueves |

---

## 6. Brecha YA → Online (qué falta construir)

| Capacidad | PEDUL YA | PEDUL Online | Acción |
|---|---|---|---|
| Galería multi-imagen | Sí | No (1 foto) | Extender schema + UI + admin |
| Proporción destacada | Sí (ancho/alto) | Distorsión reportada | Fix object-fit + dimensiones |
| PDF en noticia | Sí (DOCUMENTO) | No | Adjunto + visor/descarga |
| Cuerpo HTML / TipTap | Sí | No (campos fijos) | Portar editor por fases |
| 5 formatos | Sí | Modelo único rígido | Introducir `formato` |
| Botón externo (RDU) | Sí | Parcial (`cta`/`href`) | Tipificar y UI de reseña |
| Mosaico + detalle slug | Sí | Modal/carrusel | Homologar layout |
| Repo documentos UCAT | Sí | No | Ola posterior o PDF en noticia |
| Multi-usuario admin | Roles multi-alcaldía | JWT multi-sesión | Crear N admins + probar |

---

## 7. Plan de trabajo propuesto

### Enfoque

Adaptar el **módulo de noticias de YA dentro de Online** (Prisma + APIs + UI), no copiar el monorepo completo ni unificar backends.

### Ola 1 — Crítica para presentación (atacar primero)

**Meta:** desbloquear carga editorial lunes–martes y lucir bien el miércoles/jueves.

1. Migración Prisma: galería (`imagenes` / JSON), adjunto PDF, metadatos de proporción.
2. Upload GCS: múltiples imágenes + PDF.
3. UI pública: galería + PDF + fix imagen destacada.
4. Admin: subir N fotos + 1 PDF sin romper flujo actual.
5. Cuentas admin adicionales + prueba de acceso concurrente.

### Ola 2 — Homologación de lectura

1. Listado tipo mosaico YA con identidad Online.
2. Ruta de detalle `/observatorio/[slug]` (o equivalente).
3. Tipo/tarjeta clara de **enlace externo** (portada + reseña + CTA).

### Ola 3 — Flexibilidad editorial (si hay tiempo)

1. Cuerpo TipTap (HTML saneado).
2. Formatos explícitos TEXTO / IMAGEN / GALERIA / DOCUMENTO / VIDEO.
3. Autoguardado / menos fricción (inspirado en `editor-noticia` de plataforma-admin).

### Fuera de sprint (post-Caracas)

- Repositorio documental completo (versiones, categorías UCAT).
- Unificación con plataforma multi-alcaldía / Nest API.
- Completar páginas placeholder (ruta legal, diagnóstico, trámites, participación, geoportal).

---

## 8. Prioridad recomendada (orden de ataque)

1. **Schema + galería + PDF + proporción** (máximo impacto / desbloquea editorial).
2. **Admin de carga** de esos medios.
3. **Smoke test multi-usuario**.
4. **Mosaico + detalle** si el tiempo alcanza.
5. **TipTap / formatos completos** solo si Ola 1 está cerrada.

### Decisiones abiertas (cerrar con producto / Dr. Julio)

1. ¿Detalle de noticia en **página propia** o **modal** para el jueves?
2. ¿Cuadernillos UCAT como **PDF dentro de noticia** o sección **Documentos** aparte?
3. ¿Prioridad absoluta: **galería+PDF** o **TipTap** primero? (recomendación: galería+PDF)
4. ¿Categorías de YA o se mantienen las 4 de Online (institucional / doctrina / vuf / aula)?

---

## 9. Trabajo ya hecho en sesiones previas (histórico breve)

- Ajuste card Aula Ciudad (antifragilidad + enlace Flodesk).
- Simplificación footer (quitar Legal/Institucional/Recursos; ubicación junto a redes; link ABC del PDUL).
- Evolución mayor en casa: panel editorial, Postgres/GCS, Cloud SQL en Netlify, Aula Ciudad, fixes de login/deploy.

---

## 10. Cómo usar este documento

- **Para desarrollo:** checklist de Olas 1→3 y brecha YA→Online.
- **Para coordinación:** mapa de repos, cronograma y decisiones abiertas.
- **Para editorial:** la plataforma debe estar lista (Ola 1) antes de la carga masiva lunes–martes.

Cuando se confirmen las decisiones de la sección 8, este plan se traduce a tickets de implementación en `avipri-web`, tomando código de referencia de `portal-iribarren` y `plataforma-admin` sin fusionar productos.
