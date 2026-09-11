"use client";

import {
  faBuildingColumns,
  faCircleCheck,
  faPaperPlane,
  faRobot,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/Card";
import { MultiSelect } from "@/components/ui/MultiSelect";
import {
  INTEREST_AREAS,
  IUS_URBANO_LOGIN_URL,
  ORGANIZATION_TYPES,
  PARISHES,
  PARTICIPATION_MODES,
} from "@/lib/constants";
import {
  sanitizeCedula,
  sanitizeName,
  sanitizePhone,
  sanitizeRif,
} from "@/lib/registrations/masks";
import {
  registrationSchema,
  type RegistrationFormValues,
} from "@/lib/registrations/schema";

const baseInputClass =
  "w-full rounded-lg border bg-white px-4 py-3 outline-none transition-all focus:ring-2";
const okInputClass =
  `${baseInputClass} border-brand-border focus:border-brand-terracotta focus:ring-brand-terracotta/20`;
const errorInputClass =
  `${baseInputClass} border-red-400 focus:border-red-500 focus:ring-red-200`;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

function applyMask(
  event: ChangeEvent<HTMLInputElement>,
  sanitizer: (value: string) => string,
  onChange: (event: ChangeEvent<HTMLInputElement>) => void,
) {
  event.target.value = sanitizer(event.target.value);
  onChange(event);
}

export function RegistrationSection() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegistrationFormValues>({
    defaultValues: {
      tipo: "natural",
      nombres: "",
      cedula: "",
      ocupacion: "",
      tipoOrganizacion: "",
      razonSocial: "",
      rif: "",
      representanteNombres: "",
      representanteCedula: "",
      email: "",
      telefono: "",
      parroquia: "",
      sector: "",
      areasInteres: [],
      participacion: [],
    },
  });

  const tipo = form.watch("tipo");
  const errors = form.formState.errors;
  const nombresField = form.register("nombres");
  const cedulaField = form.register("cedula");
  const ocupacionField = form.register("ocupacion");
  const rifField = form.register("rif");
  const representanteNombresField = form.register("representanteNombres");
  const representanteCedulaField = form.register("representanteCedula");
  const emailField = form.register("email");
  const telefonoField = form.register("telefono");

  async function onSubmit(values: RegistrationFormValues) {
    setServerMessage(null);
    setServerError(null);

    const parsed = registrationSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          form.setError(field as keyof RegistrationFormValues, {
            type: "manual",
            message: issue.message,
          });
        }
      }
      setServerError("Revisa los campos marcados e inténtalo de nuevo.");
      return;
    }

    const response = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const payload = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !payload.ok) {
      setServerError(payload.error ?? "No se pudo completar el registro.");
      return;
    }

    setServerMessage("Registro enviado con éxito. AVIPRI recibirá tus datos.");
    form.reset({
      tipo,
      nombres: "",
      cedula: "",
      ocupacion: "",
      tipoOrganizacion: "",
      razonSocial: "",
      rif: "",
      representanteNombres: "",
      representanteCedula: "",
      email: "",
      telefono: "",
      parroquia: "",
      sector: "",
      areasInteres: [],
      participacion: [],
    });
  }

  return (
    <section id="registro" className="border-y border-brand-border bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <span className="text-sm font-bold uppercase tracking-wider text-brand-terracotta">
              Convocatoria de registro
            </span>
            <h2 className="mt-2 mb-6 font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
              Registro de participación ciudadana
            </h2>
            <p className="mb-6 text-slate-600">
              Inscríbete para formar parte activa en la etapa de formulación y
              en la futura consulta pública del PDUL.
            </p>
            <div className="relative overflow-hidden rounded-xl bg-brand-navy p-6 text-white shadow-lg">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
              <h4 className="mb-2 flex items-center gap-2 font-bold">
                <FontAwesomeIcon icon={faRobot} className="text-brand-orange" />
                Consulta a IUS Urbano IA
              </h4>
              <p className="mb-4 text-sm text-slate-300">
                ¿Tienes dudas sobre los requisitos legales para participar
                según el Art. 38 de la LOOU?
              </p>
              <a
                href={IUS_URBANO_LOGIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded border border-white/20 bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30"
              >
                Preguntar a IUS Urbano →
              </a>
            </div>
          </div>

          <Card className="lg:col-span-3 p-6 sm:p-8">
            <div className="mb-8 flex rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => form.setValue("tipo", "natural")}
                className={`flex-1 rounded-md px-2 py-2.5 text-xs font-medium transition-all sm:text-sm ${
                  tipo === "natural"
                    ? "bg-white text-brand-navy shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Persona natural
              </button>
              <button
                type="button"
                onClick={() => form.setValue("tipo", "juridica")}
                className={`flex-1 rounded-md px-2 py-2.5 text-xs font-medium transition-all sm:text-sm ${
                  tipo === "juridica"
                    ? "bg-white text-brand-navy shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <FontAwesomeIcon icon={faBuildingColumns} className="mr-2" />
                Organización / Comunidad
              </button>
            </div>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              autoComplete="off"
              noValidate
            >
              <div>
                <h4 className="mb-4 border-b border-brand-border pb-2 text-sm font-bold uppercase tracking-wide text-brand-navy">
                  A. Identificación
                </h4>

                {tipo === "natural" ? (
                  <div className="space-y-4">
                    <div>
                      <input
                        id="registro-nombres"
                        {...nombresField}
                        placeholder="Nombres y apellidos completos *"
                        autoComplete="name"
                        className={errors.nombres ? errorInputClass : okInputClass}
                        onChange={(event) =>
                          applyMask(event, sanitizeName, nombresField.onChange)
                        }
                      />
                      <FieldError message={errors.nombres?.message} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <input
                          id="registro-cedula"
                          {...cedulaField}
                          placeholder="Cédula (V-12345678) *"
                          autoComplete="off"
                          className={errors.cedula ? errorInputClass : okInputClass}
                          onChange={(event) =>
                            applyMask(event, sanitizeCedula, cedulaField.onChange)
                          }
                        />
                        <FieldError message={errors.cedula?.message} />
                      </div>
                      <div>
                        <input
                          {...ocupacionField}
                          placeholder="Ocupación / Profesión / Actividad"
                          className={errors.ocupacion ? errorInputClass : okInputClass}
                          onChange={(event) =>
                            applyMask(event, sanitizeName, ocupacionField.onChange)
                          }
                        />
                        <FieldError message={errors.ocupacion?.message} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <select
                        {...form.register("tipoOrganizacion")}
                        className={errors.tipoOrganizacion ? errorInputClass : okInputClass}
                      >
                        <option value="">Tipo de entidad *</option>
                        {ORGANIZATION_TYPES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <FieldError message={errors.tipoOrganizacion?.message} />
                    </div>
                    <div>
                      <input
                        {...form.register("razonSocial")}
                        placeholder="Razón social / Nombre oficial *"
                        className={errors.razonSocial ? errorInputClass : okInputClass}
                      />
                      <FieldError message={errors.razonSocial?.message} />
                    </div>
                    <div>
                      <input
                        {...rifField}
                        placeholder="RIF institucional (J-12345678-9) *"
                        className={errors.rif ? errorInputClass : okInputClass}
                        onChange={(event) =>
                          applyMask(event, sanitizeRif, rifField.onChange)
                        }
                      />
                      <FieldError message={errors.rif?.message} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <input
                          {...representanteNombresField}
                          placeholder="Representante: nombres y apellidos *"
                          className={
                            errors.representanteNombres ? errorInputClass : okInputClass
                          }
                          onChange={(event) =>
                            applyMask(
                              event,
                              sanitizeName,
                              representanteNombresField.onChange,
                            )
                          }
                        />
                        <FieldError message={errors.representanteNombres?.message} />
                      </div>
                      <div>
                        <input
                          {...representanteCedulaField}
                          placeholder="Cédula del representante *"
                          inputMode="numeric"
                          className={
                            errors.representanteCedula ? errorInputClass : okInputClass
                          }
                          onChange={(event) =>
                            applyMask(
                              event,
                              sanitizeCedula,
                              representanteCedulaField.onChange,
                            )
                          }
                        />
                        <FieldError message={errors.representanteCedula?.message} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <input
                      type="email"
                      {...emailField}
                      placeholder={
                        tipo === "juridica"
                          ? "Correo electrónico institucional *"
                          : "Correo electrónico *"
                      }
                      className={errors.email ? errorInputClass : okInputClass}
                    />
                    <FieldError message={errors.email?.message} />
                  </div>
                  <div>
                    <input
                      type="tel"
                      {...telefonoField}
                      inputMode="numeric"
                      placeholder={
                        tipo === "juridica"
                          ? "Teléfono directo / WhatsApp *"
                          : "Teléfono móvil / WhatsApp *"
                      }
                      className={errors.telefono ? errorInputClass : okInputClass}
                      onChange={(event) =>
                        applyMask(event, sanitizePhone, telefonoField.onChange)
                      }
                    />
                    <FieldError message={errors.telefono?.message} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-4 border-b border-brand-border pb-2 text-sm font-bold uppercase tracking-wide text-brand-navy">
                  B. Ubicación territorial
                </h4>
                <div className="space-y-4">
                  <div>
                    <select
                      {...form.register("parroquia")}
                      className={errors.parroquia ? errorInputClass : okInputClass}
                    >
                      <option value="">Parroquia de residencia, sede o interés *</option>
                      {PARISHES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <FieldError message={errors.parroquia?.message} />
                  </div>
                  <div>
                    <input
                      {...form.register("sector")}
                      placeholder="Sector / Barrio / Urbanización / Zona industrial *"
                      className={errors.sector ? errorInputClass : okInputClass}
                    />
                    <FieldError message={errors.sector?.message} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-4 border-b border-brand-border pb-2 text-sm font-bold uppercase tracking-wide text-brand-navy">
                  C. Áreas de interés y participación
                </h4>
                <div className="space-y-4">
                  <div>
                    <MultiSelect
                      options={INTEREST_AREAS}
                      value={form.watch("areasInteres") ?? []}
                      onChange={(next) =>
                        form.setValue("areasInteres", next, { shouldDirty: true })
                      }
                      placeholder="Áreas de interés técnico"
                      hasError={Boolean(errors.areasInteres)}
                    />
                    <FieldError message={errors.areasInteres?.message} />
                  </div>
                  <div>
                    <MultiSelect
                      options={PARTICIPATION_MODES}
                      value={form.watch("participacion") ?? []}
                      onChange={(next) =>
                        form.setValue("participacion", next, { shouldDirty: true })
                      }
                      placeholder="¿Cómo te gustaría participar?"
                      hasError={Boolean(errors.participacion)}
                    />
                    <FieldError message={errors.participacion?.message} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-orange py-4 font-bold text-white shadow-lg transition-colors hover:bg-brand-terracotta disabled:cursor-not-allowed disabled:opacity-75"
              >
                {form.formState.isSubmitting ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faPaperPlane} />
                )}
                {form.formState.isSubmitting
                  ? "Procesando..."
                  : "Inscribirme en el Registro Oficial del PDUL Iribarren"}
              </button>

              {serverMessage ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm font-medium text-brand-success">
                  <FontAwesomeIcon icon={faCircleCheck} className="mr-2" />
                  {serverMessage}
                </div>
              ) : null}

              {serverError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm font-medium text-red-700">
                  {serverError}
                </div>
              ) : null}
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
}
