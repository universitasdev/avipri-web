import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { RegistrationRecord, RegistrationStore, RegistrationStoreResult } from "@/lib/registrations/types";

const DATA_FILE = path.join(process.cwd(), ".data", "registrations.json");

export class LocalJsonRegistrationStore implements RegistrationStore {
  async save(record: RegistrationRecord): Promise<RegistrationStoreResult> {
    try {
      await mkdir(path.dirname(DATA_FILE), { recursive: true });

      let existing: RegistrationRecord[] = [];
      try {
        const raw = await readFile(DATA_FILE, "utf8");
        existing = JSON.parse(raw) as RegistrationRecord[];
      } catch {
        existing = [];
      }

      existing.push(record);
      await writeFile(DATA_FILE, JSON.stringify(existing, null, 2), "utf8");
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: "No se pudo guardar el registro de forma local.",
      };
    }
  }
}
