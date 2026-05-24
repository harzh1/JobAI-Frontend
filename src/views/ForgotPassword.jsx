import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Mail,
  Briefcase,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from "../components/ui/AppIcons";
import { Logo } from "../components/ui/Logo";


export default function ForgotPassword({ onBackToLogin }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email address.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        default:
          setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gemini-canvas-gradient flex flex-col items-center justify-center p-4">
      {/* Isolated Header Above Card */}
      <div className="flex flex-col items-center gap-2 mb-2">
        <div className="w-32 flex items-center justify-center text-[var(--text-primary)] mb-2">
          <Logo className="w-full h-auto" />
        </div>
      </div>

      <div className="w-full max-w-md card !border-transparent p-8 md:p-10 relative z-10">
        <button
          onClick={onBackToLogin}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </button>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-heading text-gray-900 mb-2">
            Reset your password
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Check your email
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <button
                onClick={onBackToLogin}
                className="primary w-full py-3.5"
              >
                Return to login
              </button>
              <p className="mt-4 text-gray-400 text-sm">
                Didn't receive the email?{" "}
                <button
                  onClick={() => setSuccess(false)}
                  className="text-[#3442FF] hover:underline font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="auth-input w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3442FF] focus:border-transparent transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>
          )}
        </div>
    </div>
  );
}
