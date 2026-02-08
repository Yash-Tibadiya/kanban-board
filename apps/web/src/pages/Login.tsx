import { authClient } from "../lib/auth-client";
import { Navigate } from "react-router-dom";
import { LoginForm } from "@/components/login-form";
import LoginHeroPanel from "@/components/login-hero-panel";
import AuthLayout from "@/layouts/AuthLayout";

export default function Login() {
  const { data: session } = authClient.useSession();

  if (session) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <AuthLayout>
      <div className="flex flex-col lg:flex-row min-h-[calc(100svh-11rem)] h-full w-full">
        <div className="flex items-center justify-center w-full bg-zinc-200/70 dark:bg-neutral-900 border-r border-edge">
          <LoginForm />
        </div>
        <div className="hidden lg:flex items-center justify-center w-full bg-linear-to-br from-white dark:from-[#141414] to-accent dark:to-neutral-950 relative">
          <LoginHeroPanel />
        </div>
      </div>
    </AuthLayout>
  );
}
