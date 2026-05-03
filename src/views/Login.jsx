import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Briefcase,
} from "../components/ui/AppIcons";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../config/firebase";

export default function ExtensionLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        default:
          setError("Failed to sign in.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0f1016] via-[#1a1b22] to-[#0f1016] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">JobAI</span>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-400 text-sm">
            Sign in to extract job details instantly
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#1c1d24] border border-[#2f3040] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#1c1d24] border border-[#2f3040] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Sign In */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3 text-gray-500 text-xs">
          <div className="flex-1 h-px bg-gray-700" />
          or continue with
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#1c1d24] border border-[#2f3040] text-sm hover:bg-[#232633]"
        >
          Continue with Google
        </button>

        {/* Signup redirect */}
        <p className="mt-6 text-center text-sm text-gray-400">
          New to JobAI?{" "}
          <button
            onClick={() =>
              chrome.tabs.create({ url: "https://yourappdomain.com" })
            }
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}
