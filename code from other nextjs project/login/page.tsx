"use client";

import Loader from "../_components/loader";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LoginForm } from "../_components/login-form";
import LoginHeroPanel from "../_components/login-hero-panel";
import { checkCurrentUserBusinessInfo } from "@/models/users-actions";
import { useEvent } from "@/hooks/use-event";

export default function LoginPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { sendEvent } = useEvent();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await authClient.getSession();
        if (data) {
          // User is already logged in, check business info using model function
          const hasInfo = await checkCurrentUserBusinessInfo();

          if (hasInfo) {
            router.push("/");
          } else {
            router.push("/business-info");
          }
        } else {
          // User is not logged in, capture view_login_page event
          sendEvent("view_login_page");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router, sendEvent]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100svh-11rem)] h-full w-full">
      <div className="flex items-center justify-center w-full bg-zinc-200/70 dark:bg-neutral-900">
        <LoginForm />
      </div>

      <div className="flex items-center justify-center w-full bg-linear-to-br from-white dark:from-[#141414] to-accent dark:to-neutral-950 relative">
        <LoginHeroPanel />
      </div>
    </div>
  );
}
