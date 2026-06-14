import React, { useEffect, useState } from "react";
import {
  User,
  LogOut,
  Bell,
  Shield,
  Mail,
  Moon,
  Sun,
  Monitor,
  CreditCard,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Camera,
  Briefcase,
  FileText,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from "../components/ui/AppIcons";
import { Card, Button } from "../components/ui/UIComponents";
import { useAuth } from "../context/AuthContext";
import { getUserStats } from "../services/database";
import { useTheme } from "../context/ThemeContext";

// Password Management Section Component
function PasswordSection({ user, setPasswordForUser, changePassword }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasPasswordProvider = user?.providerData?.some(
    (p) => p.providerId === "password"
  );

  const passwordChecks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
  };
  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isPasswordStrong) {
      setError("Please create a stronger password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (hasPasswordProvider) {
        await changePassword(currentPassword, newPassword);
        setSuccess("Password changed successfully.");
      } else {
        await setPasswordForUser(newPassword);
        setSuccess("Password set! You can now sign in with email & password.");
      }
      resetForm();
    } catch (err) {
      console.error("Password update error:", err);
      switch (err.code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Current password is incorrect.");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Please use a stronger one.");
          break;
        case "auth/requires-recent-login":
          setError("Please sign out and sign in again before changing your password.");
          break;
        case "auth/provider-already-linked":
          setError("A password is already set for this account. Use 'Change Password' instead.");
          break;
        default:
          setError(err.message || "Failed to update password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  const inputClass =
    "auth-input w-full pl-10 pr-10 py-3 rounded-xl border border-[#e1e5ea] bg-[#f8f9fa] text-sm focus:outline-none focus:ring-2 focus:ring-[#3442FF] focus:border-transparent transition-all text-[#1f1f1f]";

  return (
    <Card noPadding className="border-none shadow-sm bg-white rounded-[28px] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-5 flex items-center gap-3 text-left transition-colors hover:bg-[#f0f4f9] ${isOpen ? "border-b border-[#e1e5ea]" : ""}`}
      >
        <div className="w-8 h-8 rounded-lg bg-[#f0f4f9] text-[#1f1f1f] flex items-center justify-center shrink-0">
          <Lock size={16} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-[#1f1f1f] tracking-tight">
            {hasPasswordProvider ? "Change Password" : "Set Password"}
          </h3>
          <p className="text-xs text-[#444746]">
            {hasPasswordProvider
              ? "Update your current password"
              : "Add a password so you can also sign in with email"}
          </p>
        </div>
        <ChevronDown
          size={18}
          className={`text-[#444746] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: isOpen ? "600px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl flex items-center gap-2 text-sm bg-red-50 border border-red-200 text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl flex items-center gap-2 text-sm bg-green-50 border border-green-200 text-green-700">
              <Check className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}

          {hasPasswordProvider && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444746]" />
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444746]"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444746]" />
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444746]"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444746]" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444746]"
            >
            </button>
          </div>

          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <div className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              Passwords do not match
            </div>
          )}

          {/* Password Strength Indicators */}
          {newPassword.length > 0 && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: "length", label: "8+ characters" },
                { key: "uppercase", label: "Uppercase letter" },
                { key: "lowercase", label: "Lowercase letter" },
                { key: "number", label: "Number" },
              ].map((rule) => (
                <div
                  key={rule.key}
                  className={`flex items-center gap-1.5 ${
                    passwordChecks[rule.key] ? "text-green-600" : "text-[#c4c7c5]"
                  }`}
                >
                  <Check className="w-3 h-3" />
                  {rule.label}
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isPasswordStrong || newPassword !== confirmPassword}
            className="w-full py-3 bg-[#3442FF] hover:bg-[#2835e0] text-white text-sm font-bold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : hasPasswordProvider ? (
              "Update Password"
            ) : (
              "Set Password"
            )}
          </button>
        </form>
      </div>
    </Card>
  );
}

export default function UserProfile({ onLogout }) {
  const { user, setPasswordForUser, changePassword, deleteAccount } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    jobAlerts: true,
    weeklyDigest: false,
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await deleteAccount();
      } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
          alert("Please sign out and sign back in to verify your identity before deleting your account.");
        } else {
          alert("Failed to delete account: " + error.message);
        }
      }
    }
  };

  const [profileStats, setProfileStats] = useState({
    totalApplications: 0,
    savedJobs: 0,
    resumeCount: 0,
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const { stats } = await getUserStats(user.uid);
        setProfileStats(stats);
      } catch (err) {
        console.error("Failed to load profile stats", err);
      }
    };

    loadProfile();
  }, [user]);

  const menuItems = [
    {
      icon: Shield,
      label: "Privacy & Security",
      description: "Password and account security",
      action: "security",
    },
    {
      icon: CreditCard,
      label: "Subscription",
      description: "Manage your plan and billing",
      badge: "Pro",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "FAQ and contact support",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-10">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Profile & Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <Card noPadding className="border-none shadow-sm bg-white rounded-[28px] overflow-hidden">
            <div className="p-6 relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-[#f0f4f9] flex items-center justify-center text-[#3442FF] text-2xl font-bold shadow-inner border-2 border-white">
                    {user?.displayName?.charAt(0)?.toUpperCase() ||
                      user?.email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#3442FF] rounded-full shadow-sm flex items-center justify-center hover:bg-[#3442FF]/90 transition-colors border-2 border-white text-white">
                    <Camera size={12} />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-[#1f1f1f] tracking-tight leading-tight">
                  {user?.displayName || "User"}
                </h2>
                <p className="text-[#444746] text-sm mt-1 mb-4">{user?.email}</p>
                
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-3 py-1 bg-[#e8f0fe] text-[#3442FF] text-xs font-bold tracking-widest uppercase rounded-md">
                    Free Plan
                  </span>
                  <span className="text-[#444746] text-xs font-medium bg-[#f0f4f9] px-3 py-1 rounded-md">
                    Joined {new Date().getFullYear()}
                  </span>
                </div>

                <button onClick={onLogout} className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-[#fce8e6] hover:bg-[#fadbd8] text-[#d93025] font-bold text-sm rounded-full transition-all duration-200 active:scale-95 border-none shadow-none group">
                  <LogOut size={16} className="transition-transform group-hover:-translate-x-1" /> Sign Out
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Settings */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Appearance */}
          <Card noPadding className="border-none shadow-sm bg-white rounded-[28px] overflow-hidden">
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#f0f4f9] text-[#1f1f1f] flex items-center justify-center shrink-0">
                  <Moon size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1f1f1f] tracking-tight">Appearance</h3>
                  <p className="text-sm text-[#444746]">Customize your interface theme</p>
                </div>
              </div>
              <div className="flex items-center p-1 bg-[#f0f4f9] rounded-2xl border border-[#e1e5ea]/50 shadow-inner">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    theme === "light"
                      ? "bg-white text-[#3442FF] shadow-sm"
                      : "text-[#444746] hover:text-[#1f1f1f] hover:bg-black/5"
                  }`}
                >
                  <Sun size={16} weight={theme === "light" ? "bold" : "regular"} />
                  Light
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    theme === "system"
                      ? "bg-white text-[#3442FF] shadow-sm"
                      : "text-[#444746] hover:text-[#1f1f1f] hover:bg-black/5"
                  }`}
                >
                  <Monitor size={16} weight={theme === "system" ? "bold" : "regular"} />
                  System
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    theme === "dark"
                      ? "bg-white text-[#3442FF] shadow-sm"
                      : "text-[#444746] hover:text-[#1f1f1f] hover:bg-black/5"
                  }`}
                >
                  <Moon size={16} weight={theme === "dark" ? "bold" : "regular"} />
                  Dark
                </button>
              </div>
            </div>
          </Card>

          {/* Password Management */}
          <PasswordSection
            user={user}
            setPasswordForUser={setPasswordForUser}
            changePassword={changePassword}
          />

          {/* Notifications Settings */}
          <Card noPadding className="border-none shadow-sm bg-white rounded-[28px] overflow-hidden">
            <div className="p-5 border-b border-[#e1e5ea] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#f0f4f9] text-[#1f1f1f] flex items-center justify-center shrink-0">
                <Bell size={16} />
              </div>
              <h3 className="text-base font-bold text-[#1f1f1f] tracking-tight">Notification Preferences</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
                  { key: "push", label: "Push Notifications", desc: "Browser notifications" },
                  { key: "jobAlerts", label: "Job Alerts", desc: "New job matches" },
                  { key: "weeklyDigest", label: "Weekly Digest", desc: "Weekly summary email" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border-none rounded-[20px] transition-all bg-white shadow-sm hover:shadow-md">
                    <div>
                      <h4 className="font-semibold text-[#1f1f1f] text-sm">{item.label}</h4>
                      <p className="text-xs text-[#444746] mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifications[item.key]}
                      onClick={() => toggleNotification(item.key)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out border-none ${
                        notifications[item.key] ? "bg-[#3442FF]" : "bg-[#c4c7c5]"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-1 ${
                          notifications[item.key] ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Menu Items */}
          <Card noPadding className="border-none shadow-sm bg-white rounded-[28px] overflow-hidden">
            <div className="flex flex-col">
              {menuItems.map((item, idx) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-4 p-4 transition-colors hover:bg-[#f0f4f9] text-left group ${idx !== menuItems.length - 1 ? 'border-b border-[#e1e5ea]' : ''}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#f0f4f9] group-hover:bg-white flex items-center justify-center shrink-0 transition-colors border border-transparent group-hover:border-[#e1e5ea]">
                    <item.icon size={18} className="text-[#444746] group-hover:text-[#1f1f1f]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-[#1f1f1f] text-sm">
                        {item.label}
                      </h4>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-[#e8f0fe] text-[#3442FF] text-[10px] font-bold uppercase tracking-widest rounded-md">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#444746] mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-[#c4c7c5] group-hover:text-[#3442FF] transition-colors" />
                </button>
              ))}
            </div>
          </Card>

          {/* Danger Zone */}
          <Card noPadding className="border-none shadow-sm bg-white rounded-[28px] overflow-hidden">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#fce8e6]/30 to-transparent">
              <div>
                <h3 className="text-sm font-bold text-[#d93025] mb-1">Delete Account</h3>
                <p className="text-xs text-[#d93025]/80 font-medium max-w-md">
                  Permanently remove your account and all data. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="shrink-0 px-4 py-2.5 bg-[#d93025] hover:bg-[#c5221f] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Delete Account
              </button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
