import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { useNavigate, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();

  if (session) {
    return <Navigate to="/" />;
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: window.location.origin,
    });
    setLoading(false);
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in", // Use sign-in type for OTP login
      });

      if (error) {
        setError(error.message || "Failed to send OTP");
      } else {
        setIsOtpSent(true);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await authClient.signIn.emailOtp({
        email,
        otp,
      });

      if (error) {
        setError(error.message || "Invalid OTP");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 disabled:opacity-50 mb-4"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Continue with Google"
          )}
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-gray-500">OR</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        {!isOtpSent ? (
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your email"
              />
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading || !email}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 flex justify-center"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Continue with Email (OTP)"
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-center text-gray-600 mb-2">
              We sent a code to <strong>{email}</strong>
            </p>
            <div>
              <label
                htmlFor="otp"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Ex. 123456"
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={loading || !otp}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 flex justify-center"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Verify & Sign In"
              )}
            </button>
            <button
              onClick={() => setIsOtpSent(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 underline text-center"
              disabled={loading}
            >
              Change Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
