import type { RegistrationInput } from "@/lib/registrations/schema";

export type RegistrationRecord = RegistrationInput & {
  createdAt: string;
  source: "portal-pdul";
};

export type RegistrationStoreResult =
  | { ok: true }
  | { ok: false; error: string };

export interface RegistrationStore {
  save(record: RegistrationRecord): Promise<RegistrationStoreResult>;
}
