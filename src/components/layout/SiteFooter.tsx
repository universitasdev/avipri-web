import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import {
  faInstagram,
  faLinkedin,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { IUS_URBANO_LOGIN_URL, IUS_URBANO_URL } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-4 border-brand-terracotta bg-brand-navy pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-center gap-5 sm:gap-8">
          <Image
            src="/brand/avipri.png"
            alt="AVIPRI — Asociación Civil Venezolana Instituto de Promoción Integral"
            width={217}
            height={72}
            className="h-11 w-auto sm:h-14"
            unoptimized
          />
          <div className="h-10 w-px bg-white/30" />
          <Image
            src="/brand/universitas-legal-white.png"
            alt="Universitas Legal"
            width={180}
            height={57}
            className="h-10 w-auto sm:h-12"
          />
        </div>

        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="mb-4 font-bold text-white">Institucional</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-brand-orange">
                  Sobre AVIPRI
                </Link>
              </li>
              <li>
                <a
                  href={IUS_URBANO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-orange"
                >
                  Universitas Legal
                </a>
              </li>
              <li>
                <span>Universitas Services</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-white">PDUL Iribarren</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/#termometro" className="hover:text-brand-orange">
                  Termómetro de avance
                </Link>
              </li>
              <li>
                <Link href="/#registro" className="hover:text-brand-orange">
                  Consulta Pública (Art. 38 LOOU)
                </Link>
              </li>
              <li>
                <Link href="/observatorio" className="hover:text-brand-orange">
                  Noticiero
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-white">Recursos</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href={IUS_URBANO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-orange"
                >
                  Biblioteca Digital
                </a>
              </li>
              <li>
                <Link href="/observatorio" className="hover:text-brand-orange">
                  Aula Ciudad
                </Link>
              </li>
              <li>
                <a
                  href={IUS_URBANO_LOGIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-orange"
                >
                  Widget IUS Urbano
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-white">Legal y privacidad</h4>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              Cumplimiento DLSTA, LIG y protección de datos personales.
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLocationDot} />
                Barquisimeto, Venezuela
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-700 pt-8 md:flex-row">
          <p className="text-xs text-slate-500">
            © 2026 AVIPRI & Universitas Legal. Desarrollado por{" "}
            <span className="font-medium text-white">Universitas Services</span>.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-500 hover:text-white" aria-label="X">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="#" className="text-slate-500 hover:text-white" aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="#" className="text-slate-500 hover:text-white" aria-label="LinkedIn">
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
