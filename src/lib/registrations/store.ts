import { GoogleSheetsRegistrationStore } from "@/lib/registrations/google-sheets";
import { LocalJsonRegistrationStore } from "@/lib/registrations/local-json";
import type { RegistrationInput } from "@/lib/registrations/schema";
import type { RegistrationRecord, RegistrationStore } from "@/lib/registrations/types";

export function getRegistrationStore(): RegistrationStore {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (webhookUrl) {
    return new GoogleSheetsRegistrationStore(webhookUrl);
  }

  return new LocalJsonRegistrationStore();
}

export async function submitRegistration(input: RegistrationInput) {
  const record: RegistrationRecord = {
    ...input,
    createdAt: new Date().toISOString(),
    source: "portal-pdul",
  };

  return getRegistrationStore().save(record);
}
