# PDUL Online · Contexto del proyecto

Estado al **26 de octubre de 2026**. Este documento sirve para retomar el trabajo desde cualquier computadora, sin depender de conversaciones anteriores. `CONTEXTO-Y-PLAN.md`, en la raíz, es el plan **anterior** a este trabajo: queda como referencia histórica. Lo que vale es este archivo.

> **Para la IA:** responde siempre **en español**. Antes de tocar código de Next.js, lee `AGENTS.md`: Next 16 tiene cambios incompatibles respecto de versiones anteriores. Verifica con `git log` y `git status` que el estado descrito aquí sigue siendo cierto.

---

## 1. Qué es

**PDUL Online** (pdul.online) es el portal público del Plan de Desarrollo Urbano Local de Iribarren (Barquisimeto), del consorcio **AVIPRI & Universitas**. Tiene dos partes:

- **Sitio público** en `src/app/(site)`: portada, El ABC del PDUL (con el Termómetro), **Observatorio** de noticias, Aula Ciudad (videos), diagnóstico, geoportal y otras.
- **Panel editorial** en `src/app/admin`: lo usan **personas mayores** del equipo editorial para cargar noticias. Toda decisión de interfaz parte de eso (ver la sección 6).

Fechas clave: presentación en Caracas el **jueves 29/10/2026**; carga editorial el lunes y martes anteriores.

## 2. Tecnología

- **Next.js 16** (App Router), **React 19.2** y **TypeScript**.
  - `params` y `searchParams` son Promises.
  - El middleware se llama `src/proxy.ts`.
  - `revalidatePath("/observatorio/[slug]", "page")`.
- **Tailwind v4** con componentes **shadcn/ui** (estilo new-york). El alias `ui` apunta a `@/components/admin/ui` (ver `components.json`). Se basan en el paquete `radix-ui`.
- **Prisma 6 + PostgreSQL.**
  - En local, Postgres corre en Docker.
  - En producción es **Cloud SQL** y la app se conecta con `@google-cloud/cloud-sql-connector` (ver `src/lib/db.ts`). Con `INSTANCE_CONNECTION_NAME` definido, de `DATABASE_URL` solo se usan el usuario, la clave y la base.
- **Autenticación propia:** JWT con `jose` (access y refresh en cookies httpOnly), contraseñas con `bcryptjs`, roles `ADMIN` y `EDITOR`, y `mustChangePassword`. Si alguien entra con el mismo usuario desde otro lado, sus otras sesiones se revocan.
- **Archivos en Google Cloud Storage**, bucket `avipri-pdul-imagenes`:
  - Las fotos pasan por la API (`/api/admin/uploads/image`, máximo 3 MB, con verificación del tipo real del archivo).
  - Videos (200 MB) y PDF (20 MB) se suben **directo al bucket** con una URL firmada V4 (`src/lib/storage/gcs.ts` y `direct-upload-route.ts`).
- **Editor de texto con formato:** TipTap 3.31.4 (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`). El HTML se sanea en el servidor con `sanitize-html` 2.18.0.
- **Despliegue:** Netlify, con build `npx prisma generate && npm run build` (ver `netlify.toml`). **Netlify NO corre las migraciones** (sección 5).

## 3. Funcionalidades construidas en octubre de 2026

Todo esto está en `main` (PR #1, merge `f95fc16`) y **desplegado en producción**.

| Funcionalidad | Dónde está |
|---|---|
| **Roles admin / editor.** La editora crea y edita solo lo suyo; ve lo de otros como «Solo lectura». Solo el admin gestiona usuarios, Termómetro y noticia destacada. | `src/lib/auth/permissions.ts`, `src/app/api/admin/users/**`, `UsersManager.tsx` |
| **Contraseña obligatoria al primer ingreso** y **política de contraseñas**: mínimo 8 caracteres, una mayúscula y un símbolo, para toda contraseña nueva. Las viejas siguen sirviendo para entrar. | `src/lib/auth/password-policy.ts` (reglas compartidas por servidor y panel), `PasswordForm.tsx`, `PasswordRules.tsx` |
| **Usuarios:** crear con contraseña temporal (botones Generar y Copiar), cambiar el rol, resetear la clave y desactivar o reactivar. No se puede quitar el último admin. | `UsersManager.tsx`, `src/app/api/admin/users/[id]/route.ts` |
| **Formulario de noticia en 4 pasos:** Texto → Fotos o video → PDF → Revisar y publicar. Incluye vista previa y borrador («Visible en el sitio»). | `src/components/admin/NewsForm.tsx` (archivo grande) |
| **Cuerpo con formato** (negrita, subtítulos, listas, enlaces https). Sin migración: `lead` guarda HTML saneado, y el texto plano viejo se sigue mostrando en párrafos. | `RichTextEditor.tsx`, `src/lib/observatorio/rich-text.ts` (solo servidor), `plain-text.ts` (sirve en ambos lados) |
| **Autoguardado del borrador** en `localStorage`, por usuario y noticia. Al volver ofrece «Recuperar lo que escribí». Se borra al guardar. No guarda archivos. | `src/components/admin/news-draft.ts`, envoltorio `NewsForm` al final de `NewsForm.tsx` |
| **Galería de fotos** (1 a 12, la primera es la portada). Se achican en el navegador antes de subir. | `GalleryUpload.tsx`, `image-resize.ts` |
| **Video** de YouTube o archivo, con portada opcional. | `VideoUpload.tsx`, `NewsVideoPlayer.tsx` |
| **PDF adjunto** con visor y descarga (cuadernillos UCAT). | `DocumentUpload.tsx`, `NewsDocument.tsx` |
| **Categorías** que crea la editora con «+ Nueva categoría» (paleta de 8 colores) y **etiquetas libres** (hasta 10). | `CategoryPicker.tsx`, `TagInput.tsx`, `src/lib/observatorio/taxonomy.ts`, `categoryStyles.ts` |
| **Reseñas externas tipo RDU** (revista y enlace). | Campos `externalSource` y `externalUrl`; `ExternalReview` en `NewsArticleView.tsx` |
| **Mosaico del Observatorio** y **página propia por noticia** (`/observatorio/[slug]`), homologados con PDUL YA. Filtros `?categoria=` y `?etiqueta=`. | `NewsMosaic.tsx`, `NewsCard.tsx`, `NewsArticleView.tsx` (la comparten el sitio y la vista previa) |
| **Vista previa de borradores** antes de publicar. | `src/app/(site)/observatorio/vista-previa/[id]`, `NewsPreviewOverlay.tsx` |
| **Vistas y «Me gusta / No me gusta»**: un voto por navegador (cookie anónima `pdul_lector`); la vista cuenta una vez por sesión. | `src/lib/observatorio/engagement.ts`, `src/app/api/noticias/[slug]/interacciones/route.ts`, `NewsEngagementBar.tsx` |
| **Listado del panel** con paginación (10 por página) y filtros por estado y por autor. | `src/lib/admin/news-list.ts`, `NewsListControls.tsx`, `NewsManager.tsx` |
| **Termómetro** (fase en curso de El ABC del PDUL). | `ThermometerManager.tsx`, `src/lib/thermometer/*` |
| **Interfaz shadcn en todo el panel:** Sidebar que se recoge, Select, Checkbox, RadioGroup, ToggleGroup, Collapsible, AlertDialog, Alert y toasts con `sonner`. | `src/components/admin/ui/*`, `AdminShell.tsx` |

La sección **Videos** del panel (`/admin/videos`) está **desactivada**: sus páginas redirigen a `/admin`.

## 4. Base de datos y migraciones

`prisma/migrations` tiene 7 migraciones, todas **aplicadas en producción** (25/10/2026):

1. `20260921144722_init`: estructura inicial.
2. `20261024120000_user_roles`: roles, `active`, `mustChangePassword` y autor de cada noticia. Los usuarios que ya existían quedaron como ADMIN.
3. `20261024150000_news_video`: video en noticias.
4. `20261024180000_news_slug`: `slug` único por noticia.
5. `20261025120000_news_gallery_attachment`: tabla `NewsImage` (galería) y PDF adjunto.
6. `20261026120000_categories_tags_external`: tablas `Category`, `Tag` y `NewsTag`, y la reseña externa. **Borra las columnas viejas `category` y `categoryLabel`.**
7. `20261027120000_news_engagement`: `viewCount`, `likeCount`, `dislikeCount` y la tabla `NewsReaction`.

**Si se crea una migración nueva:** escribirla a mano cuando mueva datos, probarla en local y aplicarla en producción **justo después del merge** (sección 5).

## 5. Producción y despliegue

**Lo hace el usuario a mano: los PR y el despliegue.** La IA no abre PR ni despliega; prepara las ramas y hace commit y push solo cuando se le pide. Los mensajes de commit van en español.

- **GitHub:** `universitasdev/avipri-web`. Un merge a `main` dispara el despliegue en Netlify (proyecto `avipriweb`, dominio **pdul.online**).
- **Cloud SQL:**
  - Proyecto GCP `agente-manual-contrataciones`, instancia `cluster-produccion-01` (us-central1, PostgreSQL 18).
  - Base **`db_pdul`**, usuario **`pdul_app`**. Solo los usa el PDUL; se comprobó con Estadísticas de consultas.
  - La contraseña de `pdul_app` se cambió el 25/10/2026 y la guarda el usuario. No está en el repositorio.
  - En Netlify, `DATABASE_URL` es una variable **secreta** y no se puede ver.
- **Cómo aplicar migraciones en producción** (desde Cloud Shell, sin abrir IPs):
  ```bash
  # Pestaña 1: proxy (dejarla abierta)
  cloud-sql-proxy --port 5432 agente-manual-contrataciones:us-central1:cluster-produccion-01
  # Pestaña 2
  cd ~/avipri-web && git pull           # ya hay un clon en Cloud Shell
  export DATABASE_URL="postgresql://pdul_app:CLAVE@127.0.0.1:5432/db_pdul"
  npx prisma migrate status             # revisar que estén las pendientes esperadas
  npm run db:migrate                    # justo después del merge en GitHub
  ```
  En Cloud Shell, `npm ci` bloquea los scripts de instalación de Prisma. Hay que aprobarlos con `npm install-scripts approve prisma @prisma/engines @prisma/client` y luego `npm rebuild prisma @prisma/engines @prisma/client`. Antes de migrar, sacar una **copia de seguridad** en Cloud SQL → Copias de seguridad.
- **CORS del bucket** `avipri-pdul-imagenes`: aplicado el 25/10/2026 solo para `https://pdul.online` y `https://www.pdul.online`. Desde las vistas previas de Netlify no se pueden subir videos ni PDF. Ver `docs/gcs-cors.md`.
- **Variables de entorno** (solo los nombres; los valores están en Netlify y en el `.env` local):
  - Base de datos: `DATABASE_URL`, `INSTANCE_CONNECTION_NAME`.
  - Autenticación: `AUTH_SECRET`, `AUTH_REFRESH_SECRET`.
  - Admin inicial (seed): `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`.
  - Almacenamiento: `GCS_BUCKET`, `GCS_PROJECT_ID`, `GCS_CLIENT_EMAIL`, `GCS_PRIVATE_KEY`.
  - Otras: `YOUTUBE_API_KEY`, `PLAYLIST_ID`, `GOOGLE_SHEETS_WEBHOOK_URL`.
  - Solo en local: `POSTGRES_LOCAL_PASSWORD`.

## 6. Convenciones del panel (respetarlas)

- **Todo el texto visible va en español**, tuteando, con frases cortas y claras. Las personas usuarias son mayores.
- **Componentes shadcn siempre que se pueda**, con buen estilo y botones grandes con texto, no solo íconos.
- **Avisos:**
  - **Resultado de una acción** (publicar, guardar, eliminar): un aviso fijo `ResultBanner` que queda hasta que pulsan «Entendido». No un toast que se va solo.
  - **Validación de formularios**: `noValidate` en el `<form>` (nunca los globos del navegador), `toast.error(título, { description })`, el campo con `aria-invalid` (borde rojo) y `focus()` en el campo.
  - **Errores del servidor** dentro del formulario: `ErrorAlert` (`ui/error-alert.tsx`). En un `Alert` de shadcn el texto **siempre** va dentro de `AlertDescription`; suelto, cae en la columna del ícono y sale una palabra por línea.
- **Toda acción destructiva** (eliminar, desactivar, resetear, descartar) pide confirmación con `AlertDialog`.
- Los nombres de los botones del panel salen tal cual en los manuales. **Si se cambia un texto del panel, actualizar también los manuales.**

## 7. Entorno local

- **Postgres en Docker**: contenedor `pdul-db-local`, puerto **54329**. Si no responde: `docker start pdul-db-local`.
- **`.env` local** (no se versiona) con `DATABASE_URL` hacia Docker y las credenciales de GCS. **Ojo:** con `GCS_BUCKET` definido, las fotos que se suben en local van al **bucket real**. Para no tocarlo, levantar el servidor con `GCS_BUCKET=""`.
- **Servidor:** `npm run dev`, o `.claude/launch.json` («avipri-web», puerto 3000).
- **Cuentas de prueba locales** en `.env.usuarios-prueba` (no se versiona): `admin@pdul.test` y `editora@pdul.test`. Si entras con la misma cuenta desde la IA, se cierra la sesión del usuario: para probar sin molestarle, crear una cuenta temporal en la base local y borrarla al terminar.
- **Detalles de Windows:**
  - La ruta del proyecto tiene **espacios**: entre comillas siempre.
  - Muchos archivos usan **CRLF**: editar respetando los saltos de línea.
  - `prisma generate` falla con EPERM si el servidor de desarrollo está corriendo: detenerlo antes.
- **Verificación antes de entregar:** `npx tsc --noEmit -p .`, `npx eslint <archivos>` y `npm run build`.
  - En lint quedan errores y advertencias **viejos** en `src/components/abc/MitosSection.tsx`, `src/components/ui/carousel.tsx`, `RegistrationSection.tsx` y `admin-fetch.ts`; no son de este trabajo.
  - Las pruebas de API usadas (roles, video, galería, categorías y formato) eran scripts sueltos que no quedaron en el repositorio.

## 8. Documentos para el equipo

- `docs/guia-editorial.md`: guía corta de medidas y formatos para fotos, PDF y video.
- **Manuales de uso en Word**, en `docs/manuales/`:
  - `Manual-PDUL-Online-Editora.docx`: 44 páginas.
  - `Manual-PDUL-Online-Administrador.docx`: 53 páginas.
  - Pesan unos 14 MB y **no se versionan**: están solo en la computadora donde se generaron. Si se pierden, se regeneran así:
    1. Capturas con `puppeteer-core` y el Chrome instalado, contra un servidor local con cuentas de ejemplo.
    2. El .docx con el paquete npm `docx`.
    3. Word por COM para actualizar el índice.

## 9. Pendientes conocidos

1. **Rama `fix/aviso-borrador`** (commit `208203b`, subida a origin, **sin PR todavía**): corrige el aviso que anunciaba un borrador como «Tu noticia ya está publicada». El fallo pasaba al limpiar `?estado=&id=` de la dirección (`NewsManager.tsx`). Falta el PR a `main` y el despliegue. No necesita migración.
2. **Fotos WebP con extensión .jpg** (comunes al bajarlas de internet o de WhatsApp): `/api/admin/uploads/image` las rechaza con «El archivo no es una imagen válida», porque el tipo declarado (jpeg) no coincide con el contenido (webp). Posible arreglo: aceptar según el tipo real del archivo (`extensionFromMagic`) e ignorar el declarado, o convertir siempre en el navegador (`image-resize.ts`). En el manual ya se explica el atajo: volver a guardarla como JPG.
3. **Crear las cuentas de las editoras** en producción. Las hace un admin desde Usuarios.
4. Ideas que no se hicieron: mostrar las vistas y los «me gusta» en el listado del panel, y reactivar la sección Videos si se vuelve a necesitar.

## 10. Historial (en `main`)

- `5e5ecc1`: roles admin y editor, subida de videos, mosaico y página por noticia.
- `99d6194`: varias fotos (galería) y PDF.
- `b762b28`, `71beb6b` y `f975d14`: panel para personas mayores, ajustes de la editora (vista previa, categorías, etiquetas, RDU, imágenes) y hidratación.
- `517f37d`: vistas y «Me gusta».
- `70b3a2b`: contraseñas seguras, toasts y `ErrorAlert`.
- `20823d5`: toasts en Termómetro y Videos.
- `3151a87`: cuerpo con formato (TipTap) y autoguardado.
- `f95fc16`: merge del PR #1 a `main`, desplegado y migrado el 25/10/2026.
