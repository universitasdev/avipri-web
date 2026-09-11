/**
 * Pegar en Extensiones > Apps Script de una hoja de Google.
 * Luego: Implementar > Nueva implementación > Aplicación web
 * (Ejecutar como: yo; Quién tiene acceso: Cualquiera).
 * Copia la URL en GOOGLE_SHEETS_WEBHOOK_URL.
 */
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = JSON.parse(e.postData.contents);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Fecha",
      "Tipo",
      "Nombres",
      "Cédula",
      "Ocupación",
      "Tipo organización",
      "Razón social",
      "RIF",
      "Representante nombres",
      "Representante cédula",
      "Email",
      "Teléfono",
      "Parroquia",
      "Sector",
      "Áreas de interés",
      "Participación",
      "Fuente",
    ]);
  }

  const areas = Array.isArray(data.areasInteres)
    ? data.areasInteres.join("; ")
    : data.areasInteres || "";
  const modos = Array.isArray(data.participacion)
    ? data.participacion.join("; ")
    : data.participacion || "";

  sheet.appendRow([
    data.createdAt || "",
    data.tipo || "",
    data.nombres || "",
    data.cedula || "",
    data.ocupacion || "",
    data.tipoOrganizacion || "",
    data.razonSocial || "",
    data.rif || "",
    data.representanteNombres || data.representanteLegal || "",
    data.representanteCedula || "",
    data.email || "",
    data.telefono || "",
    data.parroquia || "",
    data.sector || "",
    areas,
    modos,
    data.source || "",
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON,
  );
}
