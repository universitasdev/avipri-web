import { z } from "zod";
import {
  INTEREST_AREAS,
  ORGANIZATION_TYPES,
  PARISHES,
  PARTICIPATION_MODES,
} from "@/lib/constants";

const parishSchema = z.enum(PARISHES);
const organizationTypeSchema = z.enum(ORGANIZATION_TYPES);
const interestSchema = z.array(z.enum(INTEREST_AREAS)).default([]);
const participationSchema = z.array(z.enum(PARTICIPATION_MODES)).default([]);

const cedulaSchema = z
  .string()
  .trim()
  .regex(
    /^[VE]-?\d{6,9}$|^\d{6,9}$/,
    "Solo V o E y números. Ejemplo: V-12345678",
  );

const telefonoSchema = z
  .string()
  .trim()
  .regex(/^\+?\d{10,15}$/, "Solo números. Ejemplo: 04145253310");

const nombresSchema = z
  .string()
  .trim()
  .min(3, "Indica nombres y apellidos")
  .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/, "Solo letras, sin números");

const rifSchema = z
  .string()
  .trim()
  .regex(
    /^[JGVEPC]-?\d{8}-?\d$/,
    "RIF inválido. Ejemplo: J-12345678-9",
  );

const sharedFields = {
  email: z.string().trim().email("Correo electrónico no válido"),
  telefono: telefonoSchema,
  parroquia: parishSchema,
  sector: z.string().trim().min(2, "Indica el sector, barrio o urbanización"),
  areasInteres: interestSchema,
  participacion: participationSchema,
};

const naturalSchema = z.object({
  tipo: z.literal("natural"),
  nombres: nombresSchema,
  cedula: cedulaSchema,
  ocupacion: z
    .string()
    .trim()
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s/-]*$/, "Solo letras")
    .optional(),
  ...sharedFields,
});

const juridicaSchema = z.object({
  tipo: z.literal("juridica"),
  tipoOrganizacion: organizationTypeSchema,
  razonSocial: z.string().trim().min(3, "Indica la razón social"),
  rif: rifSchema,
  representanteNombres: nombresSchema,
  representanteCedula: cedulaSchema,
  ...sharedFields,
});

export const registrationSchema = z.discriminatedUnion("tipo", [
  naturalSchema,
  juridicaSchema,
]);

export type RegistrationInput = z.infer<typeof registrationSchema>;

export type RegistrationFormValues = {
  tipo: "natural" | "juridica";
  nombres?: string;
  cedula?: string;
  ocupacion?: string;
  tipoOrganizacion?: string;
  razonSocial?: string;
  rif?: string;
  representanteNombres?: string;
  representanteCedula?: string;
  email?: string;
  telefono?: string;
  parroquia?: string;
  sector?: string;
  areasInteres?: string[];
  participacion?: string[];
};
