import { config } from "@/config/config";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined" &&
    (config.baseURL?.includes("localhost") || !config.baseURL)
      ? window.location.origin
      : config.baseURL,
  plugins: [emailOTPClient()],
});
