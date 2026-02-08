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
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Mail, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

// Mock SvgGoogleIcon for now if it doesn't exist, or use inline SVG
const SvgGoogleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      d="M23.766 12.276c0-.852-.067-1.71-.241-2.451H12v4.637h6.638c-.287 1.549-1.127 2.859-2.408 3.737v3.087h3.918c2.29-2.112 3.612-5.228 3.612-8.983z"
      fill="#4285F4"
    />
    <path
      d="M12 24.23c3.21 0 5.922-1.066 7.896-2.903l-3.92-3.085c-1.07.728-2.46 1.155-3.976 1.155-3.076 0-5.69-2.073-6.627-4.885H1.272v3.075C3.332 21.6 7.41 24.23 12 24.23z"
      fill="#34A853"
    />
    <path
      d="M5.373 14.512c-.22-.676-.347-1.398-.347-2.137s.127-1.46.347-2.137V7.163H1.272C.46 8.775 0 10.558 0 12.375s.46 3.6 1.272 5.212l4.101-3.075z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.75c1.78.036 3.398.665 4.632 1.838l3.435-3.468C17.915 1.173 15.203 0 12 0 7.41 0 3.332 2.63 1.272 6.787l4.101 3.075c.937-2.812 3.551-4.885 6.627-4.885z"
      fill="#EA4335"
    />
  </svg>
);

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
  const navigate = useNavigate();

  const otpSlotClassName = cn(
    "w-full border-input bg-background text-foreground",
    "dark:bg-neutral-800/50 dark:border-neutral-700 dark:text-white",
    "data-[active=true]:border-ring data-[active=true]:ring-ring",
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
      toast.success("Logged in successfully");
      navigate("/dashboard"); // Navigate to home instead of /business-info
    }
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setIsGoogleLoading(true);
    toast.info("Redirecting to Google...");
    await authClient.signIn.social({
      provider: "google",
      callbackURL: window.location.origin, // Use current origin
    });
    setIsGoogleLoading(false);
  };

  const resetToEmail = () => {
    setStage("email");
    setCode("");
    setError(null);
  };

  return (
    <div
      className={cn(
        "flex flex-col justify-center min-h-full w-full max-w-sm mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 gap-6",
        className,
      )}
    >
      <div className="flex flex-col items-center text-center">
        <h1 className="text-lg font-bold text-foreground mb-2">
          Welcome to Kanban Board
        </h1>
      </div>

      <div>
        <Button
          variant="default"
          type="button"
          className="w-full bg-white hover:bg-neutral-100 text-black border border-input font-semibold h-10 rounded-lg transition-colors cursor-pointer"
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
            className="w-full font-semibold h-11 rounded-lg transition-colors cursor-pointer"
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
            className="w-full font-semibold h-11 rounded-lg transition-colors cursor-pointer"
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
              className="underline underline-offset-2 text-foreground font-medium hover:text-foreground/80 cursor-pointer"
            >
              Email
            </button>
          </div>
        </form>
      )}

      <div className="text-neutral-600 text-center text-xs text-balance border-neutral-800">
        By signing up, you agree to our{" "}
        <Link
          to="/"
          className="underline underline-offset-2 hover:text-white/70 transition-colors"
        >
          Terms of Service{" "}
        </Link>
        and{" "}
        <Link
          to="/"
          className="underline underline-offset-2 hover:text-white/70 transition-colors"
        >
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
