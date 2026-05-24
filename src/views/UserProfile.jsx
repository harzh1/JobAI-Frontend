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
  Camera,
  Briefcase,
  FileText,
} from "../components/ui/AppIcons";
import { Card, Button } from "../components/ui/UIComponents";
import { useAuth } from "../context/AuthContext";
import { getUserStats } from "../services/database";
import { useTheme } from "../context/ThemeContext";

export default function UserProfile({ onLogout }) {
  const { user } = useAuth();
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

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Applications", value: profileStats.totalApplications ?? 0, icon: Briefcase },
              { label: "Saved Jobs", value: profileStats.savedJobs ?? 0, icon: Mail },
              { label: "Interviews", value: "-", icon: User },
              { label: "Resumes", value: profileStats.resumeCount ?? 0, icon: FileText },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border-none rounded-[24px] p-5 transition-all hover:bg-black/5 hover:shadow-md group shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#f0f4f9] group-hover:bg-[#e8f0fe] group-hover:text-[#3442FF] flex items-center justify-center transition-colors text-[#444746]">
                    <stat.icon size={16} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#1f1f1f] tracking-tight">{stat.value}</div>
                <div className="text-xs font-medium text-[#444746] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
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
              <button className="shrink-0 px-4 py-2.5 bg-[#d93025] hover:bg-[#c5221f] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                Delete Account
              </button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
