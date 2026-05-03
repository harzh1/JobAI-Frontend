import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  ArrowRight,
  User,
  AlertCircle,
  Check,
} from "../components/ui/AppIcons";

export default function Signup({ onSwitchToLogin }) {
  const { signup, signInWithGoogle } = useAuth();
  const { resolvedTheme } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const isDark = resolvedTheme === "dark";

  // Password strength validation
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!isPasswordStrong) {
      setError("Please create a stronger password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions.");
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, displayName);
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Please use a stronger password.");
          break;
        default:
          setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setError("Failed to sign up with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all";
  const inputLight =
    "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-indigo-500";
  const inputDark =
    "bg-[#1c1d24] border border-[#2f3040] text-gray-100 placeholder-gray-500 focus:ring-indigo-400";

  return (
    <div
      className={`min-h-screen flex ${
        isDark
          ? "bg-gradient-to-br from-[#0b0c10] via-[#0b0d14] to-[#111827]"
          : "bg-gradient-to-br from-slate-50 via-white to-indigo-50"
      }`}
    >
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">JobAI</span>
          </div>
          <p className="text-indigo-100 text-sm">
            Your AI-powered job search assistant
          </p>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Start your journey to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                career success
              </span>
            </h2>
            <p className="text-indigo-100 text-lg max-w-md">
              Join thousands of job seekers who've accelerated their job search
              with AI.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "AI-powered application tracking",
              "Smart job recommendations",
              "Resume optimization tips",
              "Interview preparation guides",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-indigo-200 text-sm">
          c 2026 JobAI. All rights reserved.
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div
        className={`w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto ${
          isDark ? "bg-[#0f1016]" : ""
        }`}
      >
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isDark ? "bg-gradient-to-br from-indigo-500 to-purple-500" : "bg-gradient-to-br from-indigo-600 to-purple-600"
              }`}
            >
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              JobAI
            </span>
          </div>

          <div className="text-center mb-8">
            <h1
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Create your account
            </h1>
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>
              Start your free trial - no credit card required
            </p>
          </div>

          {error && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                isDark
                  ? "bg-red-500/10 border border-red-500/40 text-red-200"
                  : "bg-red-50 border border-red-100 text-red-600"
              }`}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                className={`text-sm font-medium ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  className={`${inputBase} ${isDark ? inputDark : inputLight} pl-12 pr-4 py-3.5`}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className={`text-sm font-medium ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`${inputBase} ${isDark ? inputDark : inputLight} pl-12 pr-4 py-3.5`}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className={`text-sm font-medium ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className={`${inputBase} ${isDark ? inputDark : inputLight} pl-12 pr-12 py-3.5`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                    isDark
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password strength indicators */}
              {password && (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-4 gap-1">
                    {Object.values(passwordChecks).map((check, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all ${
                          check ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span
                      className={
                        passwordChecks.length
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      - 8+ characters
                    </span>
                    <span
                      className={
                        passwordChecks.uppercase
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      - Uppercase
                    </span>
                    <span
                      className={
                        passwordChecks.lowercase
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      - Lowercase
                    </span>
                    <span
                      className={
                        passwordChecks.number
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      - Number
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                className={`text-sm font-medium ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className={`${inputBase} ${
                    isDark ? inputDark : inputLight
                  } pl-12 pr-12 py-3.5 ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-300"
                      : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                    isDark
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className={`mt-1 w-4 h-4 rounded focus:ring-indigo-500 ${
                  isDark
                    ? "text-indigo-400 border-gray-500 bg-[#1c1d24]"
                    : "text-indigo-600 border-gray-300"
                }`}
              />
              <label
                htmlFor="terms"
                className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
              >
                I agree to the{" "}
                <a
                  href="#"
                  className={
                    isDark
                      ? "text-indigo-400 hover:underline"
                      : "text-indigo-600 hover:underline"
                  }
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className={
                    isDark
                      ? "text-indigo-400 hover:underline"
                      : "text-indigo-600 hover:underline"
                  }
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6 ${
                isDark
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-black/30"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-indigo-200"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div
              className={`flex-1 h-px ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
            <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-400"}`}>
              or
            </span>
            <div
              className={`flex-1 h-px ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm ${
              isDark
                ? "bg-[#1c1d24] border border-[#2f3040] text-gray-100 hover:bg-[#232633]"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </button>

          <p
            className={`mt-8 text-center ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className={`font-semibold ${
                isDark
                  ? "text-indigo-400 hover:text-indigo-300"
                  : "text-indigo-600 hover:text-indigo-700"
              }`}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
