import { faCheck, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getThermometer } from "@/lib/thermometer/getThermometer";

export async function StatusTracker() {
  const thermometer = await getThermometer();

  return (
    <section
      id="termometro"
      className="relative z-20 mx-auto mb-10 -mt-16 max-w-6xl scroll-mt-28 px-4 sm:px-6 lg:px-8"
    >
      <div className="glass-panel rounded-2xl border border-brand-border p-6 shadow-xl sm:p-10">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-2xl font-bold text-brand-navy">
            Termómetro del Proceso
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            Sigue en tiempo real el avance del PDUL
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="absolute top-4 left-[6%] right-[6%] z-0 hidden h-0.5 -translate-y-1/2 rounded bg-slate-200 md:block" />
          <div className="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:gap-0">
            {thermometer.steps.map((step, index) => (
              <div
                key={step.key}
                className={`group flex w-full min-w-0 items-center gap-3 text-left md:w-auto md:flex-1 md:flex-col md:gap-1.5 md:px-0.5 md:text-center ${
                  step.state === "upcoming" ? "opacity-60" : ""
                }`}
              >
                <div className="relative h-8 w-8 shrink-0">
                  {step.state === "active" ? (
                    <div className="absolute inset-0 animate-ping rounded-full bg-brand-terracotta opacity-75" />
                  ) : null}
                  <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white shadow-md ${
                      step.state === "done"
                        ? "bg-brand-success text-white"
                        : step.state === "active"
                          ? "bg-brand-terracotta text-white"
                          : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {step.state === "done" ? (
                      <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                </div>
                <div className="min-w-0 md:w-full">
                  <div
                    className={`text-[11px] leading-tight font-bold sm:text-xs ${
                      step.state === "active"
                        ? "text-brand-navy"
                        : step.state === "done"
                          ? "text-slate-800"
                          : "text-slate-600"
                    }`}
                  >
                    {step.label}
                    {step.sublabel ? (
                      <>
                        <br />
                        {step.sublabel}
                      </>
                    ) : null}
                  </div>
                  <div
                    className={`mt-0.5 text-[10px] font-medium sm:text-[11px] ${
                      step.state === "done"
                        ? "text-brand-success"
                        : step.state === "active"
                          ? "text-brand-terracotta"
                          : "text-slate-400"
                    }`}
                  >
                    {step.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-lg border-t border-slate-100 bg-brand-bone/50 p-4 pt-6">
          <FontAwesomeIcon
            icon={faCircleInfo}
            className="mt-1 text-brand-orange"
          />
          <p className="text-sm text-slate-600">
            <strong className="text-brand-navy">{thermometer.activeTitle}</strong>{" "}
            {thermometer.activeDescription}
          </p>
        </div>
      </div>
    </section>
  );
}
