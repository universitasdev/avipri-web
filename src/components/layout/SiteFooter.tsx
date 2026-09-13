import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import {
  faInstagram,
  faLinkedin,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-4 border-brand-terracotta bg-brand-navy pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-5 sm:gap-8">
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

          <div className="md:text-right">
            <h4 className="mb-4 font-bold text-white">PDUL Iribarren</h4>
            <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <Link href="/#termometro" className="hover:text-brand-orange">
                Termómetro de avance
              </Link>
            </li>
            <li>
              <Link href="/abc-pdul" className="hover:text-brand-orange">
                ABC del PDUL
              </Link>
            </li>
            <li>
              <Link href="/observatorio" className="hover:text-brand-orange">
                Noticiero
              </Link>
            </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-700 pt-8 md:flex-row">
          <p className="text-xs text-slate-500">
            © 2026 AVIPRI & Universitas Legal. Desarrollado por{" "}
            <span className="font-medium text-white">Universitas Services</span>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-2 text-sm text-slate-400">
              <FontAwesomeIcon icon={faLocationDot} />
              Barquisimeto, Venezuela
            </span>
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
      </div>
    </footer>
  );
}
