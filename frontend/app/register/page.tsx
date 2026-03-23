import { redirectAuthenticatedUser } from "@/features/auth/lib/server-session";
import { RegisterForm } from "@/features/auth/components/register-form";

export default async function RegisterPage() {
  await redirectAuthenticatedUser();

  return <RegisterForm />;
}
