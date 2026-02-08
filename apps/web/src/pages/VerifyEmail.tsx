import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await authClient.emailOtp.verifyEmail({
        email: (await authClient.getSession()).data?.user.email || "",
        otp,
      });

      if (error) {
        setError(error.message || "Verification failed");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await authClient.getSession();
      if (!session.data?.user.email) {
        setError("Could not find email to resend OTP");
        return;
      }
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: session.data.user.email,
        type: "email-verification",
      });

      if (error) {
        setError(error.message || "Failed to resend OTP");
      } else {
        alert("OTP sent using resend!");
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
        <h1 className="text-2xl font-bold mb-6 text-center">Verify Email</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label
            htmlFor="otp"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Verification Code
          </label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter OTP"
          />
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Verify"}
          </button>
          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
}
