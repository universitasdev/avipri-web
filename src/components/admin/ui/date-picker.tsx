"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es as dateFnsEs } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { es } from "react-day-picker/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/admin/ui/button";
import { Calendar } from "@/components/admin/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/admin/ui/popover";

function parseISODate(value?: string) {
  if (!value) return undefined;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function toISODate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function DatePicker({
  id,
  name,
  required,
  defaultValue,
  placeholder = "Selecciona una fecha",
}: {
  id?: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [date, setDate] = useState<Date | undefined>(() => parseISODate(defaultValue));
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-0">
      <input
        type="hidden"
        name={name}
        value={date ? toISODate(date) : ""}
        required={required}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon />
            {date ? format(date, "d 'de' MMMM 'de' yyyy", { locale: dateFnsEs }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={es}
            selected={date}
            defaultMonth={date}
            captionLayout="dropdown"
            startMonth={new Date(2018, 0)}
            endMonth={new Date(2036, 11)}
            onSelect={(next) => {
              setDate(next);
              if (next) setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
