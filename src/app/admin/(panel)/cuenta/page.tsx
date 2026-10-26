import { PasswordForm } from "@/components/admin/PasswordForm";

export default function AdminAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-navy">Mi cuenta</h1>
        <p className="mt-1 text-sm text-brand-muted">Actualiza tu contraseña de acceso al panel.</p>
      </div>
      <PasswordForm />
    </div>
  );
}
