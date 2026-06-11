import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="sr-only">Crear cuenta en FORGE</h1>
        <RegisterForm />
      </div>
    </main>
  );
}
