# CORS del bucket de Cloud Storage

Los videos (hasta 200 MB) y los PDF (hasta 20 MB) de las noticias no pasan por Netlify: el
panel pide una URL firmada a `/api/admin/uploads/video` o `/api/admin/uploads/document` y el
navegador sube el archivo **directo al bucket** con `PUT`. Para que el navegador lo permita,
el bucket necesita una regla CORS. Sin ella, las fotos y los enlaces de YouTube funcionan,
pero subir un video o un PDF falla en producción.

## Pasos (una sola vez)

1. Edita [`gcs-cors.json`](gcs-cors.json) y reemplaza `REEMPLAZAR-NOMBRE-DEL-SITIO.netlify.app`
   por el dominio real de Netlify (o bórralo si solo se usa `pdul.online`). Agrega también
   cualquier dominio de previsualización desde el que se vaya a usar el panel.
2. Con una cuenta que tenga permisos sobre el bucket (`GCS_BUCKET` del `.env`):

   ```bash
   gcloud storage buckets update gs://NOMBRE_DEL_BUCKET --cors-file=docs/gcs-cors.json
   ```

3. Comprueba que quedó aplicada:

   ```bash
   gcloud storage buckets describe gs://NOMBRE_DEL_BUCKET --format="default(cors_config)"
   ```

## Qué permite la regla

- `PUT` desde los dominios del sitio: la subida con URL firmada.
- `GET` y `HEAD`: lectura de los archivos (los objetos ya son públicos).
- Cabeceras `Content-Type` y `x-goog-content-length-range`: la URL firmada exige ambas; la
  segunda es la que limita el tamaño (200 MB video, 20 MB PDF) en el propio bucket.

## Si algo falla

- **Error de CORS en la consola del navegador al subir:** el dominio desde el que se usa el
  panel no está en `origin`.
- **403 `SignatureDoesNotMatch`:** el reloj del servidor o las credenciales `GCS_CLIENT_EMAIL` /
  `GCS_PRIVATE_KEY` no son las de la cuenta de servicio con permiso sobre el bucket.
- **400 por tamaño:** el archivo supera el límite; el panel ya avisa antes de subir.
