import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/admin/ui/alert";

/**
 * Aviso de error con la estructura del Alert de shadcn (ícono, título y explicación).
 * El texto siempre va dentro de AlertDescription: suelto, caería en la columna del ícono.
 */
export function ErrorAlert({
  title,
  children,
  className,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Alert variant="destructive" className={className}>
      <CircleAlert aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      {children ? <AlertDescription>{children}</AlertDescription> : null}
    </Alert>
  );
}
