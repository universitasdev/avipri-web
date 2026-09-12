"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IUS_URBANO_LOGIN_URL, NAV_LINKS } from "@/lib/constants";

function RobotIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M12 2a2 2 0 0 1 2 2v1h3a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h3V4a2 2 0 0 1 2-2Zm-4 8a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 8 10Zm8 0a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 16 10ZM9 16h6v1.5H9V16Z" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-white shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center pl-3 sm:pl-6 lg:pl-10">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
            aria-label="Inicio IUS Urbano"
          >
            <Image
              src="/brand/ius-urbano.png"
              alt="IUS Urbano"
              width={220}
              height={79}
              className="h-10 w-auto sm:h-12"
              priority
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => {
            const path = link.href.split("#")[0] || "/";
            const active =
              path === "/"
                ? pathname === "/" && !link.href.includes("#")
                : pathname.startsWith(path);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors ${
                  active
                    ? "text-brand-terracotta"
                    : "text-brand-text hover:text-brand-navy"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href={IUS_URBANO_LOGIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-medium text-brand-orange transition-colors hover:text-brand-terracotta"
          >
            <RobotIcon />
            IUS Urbano (IA)
          </a>
        </nav>

        <button
          type="button"
          className="p-2 text-brand-navy lg:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((value) => !value)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-current">
            {open ? (
              <path d="M6.2 5 5 6.2 10.8 12 5 17.8 6.2 19 12 13.2 17.8 19 19 17.8 13.2 12 19 6.2 17.8 5 12 10.8 6.2 5Z" />
            ) : (
              <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div className="absolute w-full border-t border-brand-border bg-white shadow-lg lg:hidden">
          <div className="flex flex-col space-y-3 px-4 pb-6 pt-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 font-medium text-brand-text hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={IUS_URBANO_LOGIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md px-3 py-2 font-medium text-brand-orange hover:bg-slate-50"
            >
              <RobotIcon />
              IUS Urbano (IA)
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
