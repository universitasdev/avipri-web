import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WHATSAPP_URL } from "@/lib/constants";

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="Solicitar asesoría"
      className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-3xl text-white shadow-lg transition-all hover:scale-110 hover:bg-green-600"
    >
      <FontAwesomeIcon icon={faWhatsapp} />
      <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded bg-slate-800 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        Solicitar asesoría
      </span>
    </a>
  );
}
