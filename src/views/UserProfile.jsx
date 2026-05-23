import React, { useEffect, useState } from "react";
import {
  User,
  LogOut,
  Bell,
  Shield,
  Mail,
  Moon,
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
  const { theme, setTheme, resolvedTheme } = useTheme();
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
      icon: Bell,
      label: "Notifications",
      description: "Manage your notification preferences",
      action: "notifications",
    },
    {
      icon: Shield,
      label: "Privacy & Security",
      description: "Password, 2FA, and account security",
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
      description: "FAQ, contact support, feedback",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Profile Header */}
      <Card noPadding className="border-none shadow-none bg-[#f0f4f9] rounded-[32px] overflow-hidden relative">
        {/* Decorative Liquid Glass Header Banner */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none hidden sm:block">
          <div className="absolute -top-20 -right-10 w-64 h-64 bg-[#e8f0fe] rounded-full mix-blend-multiply opacity-50 blur-3xl"></div>
          <div className="absolute bottom-10 -left-10 w-40 h-40 bg-[#e8f0fe] rounded-full mix-blend-multiply opacity-50 blur-3xl"></div>
        </div>

        <div className="p-8 sm:p-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-[#1f1f1f] text-3xl font-semibold shadow-sm border border-[#e1e5ea]">
                {user?.displayName?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#3846e6] rounded-full shadow-sm flex items-center justify-center hover:bg-[#3846e6]/90 transition-colors border-2 border-[#f0f4f9] text-white">
                <Camera size={14} />
              </button>
            </div>
            <div className="flex-1 space-y-1.5 text-center sm:text-left mt-2">
              <h2 className="text-[26px] font-normal text-[#1f1f1f] tracking-tight leading-none mb-2">
                {user?.displayName || "User"}
              </h2>
              <p className="text-[#444746] text-[15px] font-medium">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 pt-1">
                <span className="px-3.5 py-1.5 bg-white text-[#1f1f1f] text-[12px] font-bold tracking-widest uppercase rounded-full shadow-sm border border-[#e1e5ea]/50">
                  Free Plan
                </span>
                <span className="text-[#444746] text-[13px] font-medium ml-1">
                  Joined {new Date().getFullYear()}
                </span>
              </div>
            </div>
            <button onClick={onLogout} className="mt-4 sm:mt-0 flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#e1e5ea]/80 text-[#1f1f1f] font-semibold text-[14px] tracking-wide rounded-full transition-colors shrink-0 shadow-sm border-none">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          {
            label: "Applications",
            value: profileStats.totalApplications ?? 0,
            icon: Briefcase,
          },
          { label: "Interviews", value: "-", icon: User },
          {
            label: "Saved Jobs",
            value: profileStats.savedJobs ?? 0,
            icon: Mail,
          },
          {
            label: "Resumes",
            value: profileStats.resumeCount ?? 0,
            icon: FileText,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#e1e5ea] rounded-[24px] p-6 text-center transition-all hover:bg-[#f0f4f9] hover:border-transparent group">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#f0f4f9] group-hover:bg-white flex items-center justify-center transition-colors">
              <stat.icon size={22} className="text-[#1f1f1f]" />
            </div>
            <div className="text-[32px] font-normal text-[#1f1f1f] leading-none mb-2 tracking-tight">{stat.value}</div>
            <div className="text-[13px] font-medium text-[#444746]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Appearance */}
      <Card noPadding className="border border-[#e1e5ea] shadow-none bg-white rounded-[28px] mt-8 overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#f0f4f9] text-[#1f1f1f] flex items-center justify-center shrink-0">
              <Moon size={24} />
            </div>
            <div>
              <h3 className="text-[18px] font-medium text-[#1f1f1f] tracking-tight">Appearance</h3>
              <p className="text-[14px] text-[#444746] mt-1 font-normal">Choose light, dark, or follow system preference</p>
            </div>
          </div>
          <div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="text-[15px] font-medium border-none rounded-full px-6 py-3.5 bg-[#f0f4f9] text-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-[#3846e6]/20 cursor-pointer appearance-none min-w-[160px] text-center"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Notifications Settings */}
      <Card noPadding className="border border-[#e1e5ea] shadow-none bg-white rounded-[28px] mt-6 overflow-hidden">
        <div className="p-6 sm:p-8">
          <h3 className="text-[18px] font-medium text-[#1f1f1f] mb-6 flex items-center gap-4 tracking-tight">
            <div className="w-14 h-14 rounded-full bg-[#f0f4f9] text-[#1f1f1f] flex items-center justify-center shrink-0">
              <Bell size={24} />
            </div>
            Notification Preferences
          </h3>
          <div className="space-y-1">
            {[
              {
                key: "email",
                label: "Email Notifications",
                desc: "Receive updates via email",
              },
              {
                key: "push",
                label: "Push Notifications",
                desc: "Browser notifications",
              },
              { key: "jobAlerts", label: "Job Alerts", desc: "New job matches" },
              {
                key: "weeklyDigest",
                label: "Weekly Digest",
                desc: "Weekly summary email",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 rounded-[20px] transition-colors hover:bg-[#f0f4f9]"
              >
                <div>
                  <h4 className="font-medium text-[#1f1f1f] text-[15px]">{item.label}</h4>
                  <p className="text-[13px] text-[#444746] mt-0.5">{item.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications[item.key]}
                  onClick={() => toggleNotification(item.key)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out border-none ${
                    notifications[item.key] ? "bg-[#3846e6]" : "bg-[#c4c7c5]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-1 ${
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
      <Card noPadding className="border border-[#e1e5ea] shadow-none bg-white rounded-[28px] mt-6 overflow-hidden">
        <div className="flex flex-col p-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-5 p-4 sm:p-5 rounded-[20px] transition-colors hover:bg-[#f0f4f9] text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-[#f0f4f9] group-hover:bg-white flex items-center justify-center shrink-0 transition-colors">
                <item.icon size={22} className="text-[#1f1f1f]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium text-[#1f1f1f] text-[15px]">
                    {item.label}
                  </h4>
                  {item.badge && (
                    <span className="px-3 py-1 bg-[#e8f0fe] text-[#3846e6] text-[11px] font-bold uppercase tracking-widest rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[#444746] mt-0.5 font-normal">
                  {item.description}
                </p>
              </div>
              <ChevronRight
                size={20}
                className="text-[#c4c7c5] group-hover:text-[#444746] transition-colors mr-2"
              />
            </button>
          ))}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card noPadding className="border-none bg-[#fce8e6]/50 rounded-[28px] mt-6 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-[18px] font-medium text-[#d93025] mb-1.5 tracking-tight flex items-center gap-2">Danger Zone</h3>
            <p className="text-[14px] text-[#d93025]/80 font-normal">
              Once you delete your account, there is no going back. All data
              will be permanently removed.
            </p>
          </div>
          <button className="whitespace-nowrap px-6 py-3 bg-[#d93025] hover:bg-[#c5221f] text-white text-[14px] font-semibold tracking-wide rounded-full transition-colors border-none shadow-none">
            Delete Account
          </button>
        </div>
      </Card>
    </div>
  );
}
