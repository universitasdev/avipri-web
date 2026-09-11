import type { RegistrationRecord, RegistrationStore, RegistrationStoreResult } from "@/lib/registrations/types";

export class GoogleSheetsRegistrationStore implements RegistrationStore {
  constructor(private readonly webhookUrl: string) {}

  async save(record: RegistrationRecord): Promise<RegistrationStoreResult> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
        cache: "no-store",
      });

      if (!response.ok) {
        return {
          ok: false,
          error: "No se pudo guardar el registro en la hoja de cálculo.",
        };
      }

      return { ok: true };
    } catch {
      return {
        ok: false,
        error: "Error de red al enviar el registro. Inténtalo de nuevo.",
      };
    }
  }
}
