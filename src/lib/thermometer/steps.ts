export const THERMOMETER_STEPS = [
  { key: "decreto", label: "Decreto Alcalde", upcomingStatus: "Pendiente" },
  {
    key: "plan-trabajo",
    label: "Aprobación Plan de trabajo",
    upcomingStatus: "Pendiente",
  },
  { key: "diagnostico", label: "Diagnóstico", upcomingStatus: "Pendiente" },
  { key: "formulacion", label: "Formulación", upcomingStatus: "Pendiente" },
  {
    key: "consulta",
    label: "Consulta Pública",
    sublabel: "(60 días)",
    upcomingStatus: "Próximamente",
  },
  {
    key: "camara",
    label: "Aprobación Cámara",
    upcomingStatus: "Pendiente",
  },
  { key: "vigencia", label: "Vigencia", upcomingStatus: "Futuro" },
] as const;

export type ThermometerStepState = "done" | "active" | "upcoming";

export type ThermometerView = {
  activeIndex: number;
  activeTitle: string;
  activeDescription: string;
  steps: Array<{
    key: string;
    label: string;
    sublabel?: string;
    status: string;
    state: ThermometerStepState;
  }>;
};

export function buildThermometerView(input: {
  activeIndex: number;
  activeTitle: string;
  activeDescription: string;
}): ThermometerView {
  const activeIndex = Math.min(
    THERMOMETER_STEPS.length - 1,
    Math.max(0, input.activeIndex),
  );

  return {
    activeIndex,
    activeTitle: input.activeTitle,
    activeDescription: input.activeDescription,
    steps: THERMOMETER_STEPS.map((step, index) => {
      const state: ThermometerStepState =
        index < activeIndex ? "done" : index === activeIndex ? "active" : "upcoming";
      return {
        key: step.key,
        label: step.label,
        sublabel: "sublabel" in step ? step.sublabel : undefined,
        status:
          state === "done"
            ? "Completado"
            : state === "active"
              ? "En curso"
              : step.upcomingStatus,
        state,
      };
    }),
  };
}

export const DEFAULT_THERMOMETER = {
  activeIndex: 1,
  activeTitle: "Fase 2: Aprobación del Plan de trabajo.",
  activeDescription:
    "DPCU diseña un plan de trabajo, cronograma y presupuesto del proyecto.",
};
