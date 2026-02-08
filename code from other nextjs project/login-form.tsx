"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Mail } from "lucide-react";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { SvgGoogleIcon } from "@/components/icons/Icons";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [stage, setStage] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const otpSlotClassName = cn(
    "w-full border-input bg-background text-foreground",
    "dark:bg-neutral-800/50 dark:border-neutral-700 dark:text-white",
    "data-[active=true]:border-ring data-[active=true]:ring-ring"
  );

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });

    if (error) {
      setError(error.message || "Failed to send OTP");
      toast.error(error.message || "Failed to send OTP");
    } else {
      toast.success("Login code sent to your email");
      setStage("otp");
    }
    setLoading(false);
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authClient.signIn.emailOtp({
      email,
      otp: code,
    });

    if (error) {
      setError(error.message || "Invalid code");
      toast.error(error.message || "Invalid code");
    } else {
      // PostHogProvider handles login tracking (new_user_created / user_login_successfully)
      toast.success("Logged in successfully");
      router.push("/business-info");
    }
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setIsGoogleLoading(true);
    toast.info("Redirecting to Google...");
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/business-info",
    });
    setIsGoogleLoading(false);
  };

  const resetToEmail = () => {
    setStage("email");
    setCode("");
    setError(null);
  };

  return (
    <div className="flex flex-col justify-center min-h-full w-full max-w-sm mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 gap-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-lg font-bold text-foreground mb-2">
          Welcome to the future of finance
        </h1>
      </div>

      <div>
        <Button
          variant="default"
          type="button"
          className="w-full bg-white hover:bg-neutral-100 text-black border border-input font-semibold h-10 rounded-lg transition-colors"
          onClick={signInWithGoogle}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <LoaderCircle className="animate-spin size-4" />
          ) : (
            <>
              <SvgGoogleIcon className="size-5" />
              <span>Login with Google</span>
            </>
          )}
        </Button>
      </div>

      <div className="flex border border-border mt-3"></div>

      {stage === "email" ? (
        <form onSubmit={requestOtp} className="grid gap-6">
          <Field>
            <FieldLabel
              htmlFor="email"
              className="text-foreground text-sm font-medium"
            >
              Email
            </FieldLabel>
            <InputGroup className="bg-background dark:bg-neutral-800/50 border-input dark:border-neutral-700 h-11 rounded-lg">
              <InputGroupInput
                id="email"
                type="email"
                required
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-foreground dark:text-white placeholder:text-muted-foreground"
              />
              <InputGroupAddon>
                <Mail className="size-5" />
              </InputGroupAddon>
            </InputGroup>
            {error && <FieldError className="text-red-400">{error}</FieldError>}
          </Field>
          <Button
            variant="default"
            type="submit"
            className="w-full font-semibold h-11 rounded-lg transition-colors"
            disabled={loading || !email}
          >
            {loading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              "Send Login Code"
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="grid gap-6">
          <Field>
            <FieldLabel className="text-foreground text-sm font-medium">
              6-digit code
            </FieldLabel>
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(v) => setCode(v.replace(/\D/g, ""))}
              containerClassName="justify-center"
            >
              <InputOTPGroup className="w-full">
                <InputOTPSlot index={0} className={otpSlotClassName} />
                <InputOTPSlot index={1} className={otpSlotClassName} />
                <InputOTPSlot index={2} className={otpSlotClassName} />
                <InputOTPSlot index={3} className={otpSlotClassName} />
                <InputOTPSlot index={4} className={otpSlotClassName} />
                <InputOTPSlot index={5} className={otpSlotClassName} />
              </InputOTPGroup>
            </InputOTP>
            {error && <FieldError className="text-red-400">{error}</FieldError>}
          </Field>
          <Button
            variant="default"
            type="submit"
            className="w-full font-semibold h-11 rounded-lg transition-colors"
            disabled={loading || code.length !== 6}
          >
            {loading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              "Verify and Login"
            )}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Use a different{" "}
            <button
              type="button"
              onClick={resetToEmail}
              className="underline underline-offset-2 text-foreground font-medium hover:text-foreground/80"
            >
              Email
            </button>
          </div>
        </form>
      )}

      <div className="text-neutral-600 text-center text-xs text-balance border-neutral-800">
        By signing up, you agree to our{" "}
        <Link
          href="/"
          className="underline underline-offset-2 hover:text-white/70 transition-colors"
        >
          Terms of Service{" "}
        </Link>
        and{" "}
        <Link
          href="/"
          className="underline underline-offset-2 hover:text-white/70 transition-colors"
        >
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
