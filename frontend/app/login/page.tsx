import { redirectAuthenticatedUser } from "@/features/auth/lib/server-session";
import { LoginForm } from "@/features/auth/components/login-form";

export default async function LoginPage() {
  await redirectAuthenticatedUser();

  return <LoginForm />;
}
