"use client";

import { useEffect, useRef, useState } from "react";

type MultiSelectProps = {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  hasError?: boolean;
};

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  hasError = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const label =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? value[0]
        : `${value.length} seleccionadas`;

  function toggle(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
      return;
    }
    onChange([...value, option]);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between rounded-lg border bg-white px-4 py-3 text-left outline-none transition-all focus:ring-2 ${
          hasError
            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
            : "border-brand-border focus:border-brand-terracotta focus:ring-brand-terracotta/20"
        } ${value.length === 0 ? "text-slate-500" : "text-brand-text"}`}
      >
        <span className="mr-3 line-clamp-1">{label}</span>
        <span className="shrink-0 text-slate-400">{open ? "▴" : "▾"}</span>
      </button>
      {open ? (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-brand-border bg-white p-2 shadow-lg">
          {options.map((option) => {
            const checked = value.includes(option);
            return (
              <label
                key={option}
                className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option)}
                  className="mt-1 accent-brand-terracotta"
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
