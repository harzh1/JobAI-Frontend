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
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header */}
      <Card className="border border-gray-100 shadow-sm">
        <div className="px-6 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-indigo-600 text-2xl font-semibold border border-gray-200">
                {user?.displayName?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200">
                <Camera size={14} className="text-gray-600" />
              </button>
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user?.displayName || "User"}
              </h2>
              <p className="text-gray-600 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                  Free Plan
                </span>
                <span className="text-gray-400 text-xs">
                  Joined {new Date().getFullYear()}
                </span>
              </div>
            </div>
            <Button variant="secondary" icon={LogOut} onClick={onLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Applications",
            value: profileStats.totalApplications ?? 0,
            icon: Briefcase,
            color: "indigo",
          },
          { label: "Interviews", value: "-", icon: User, color: "green" },
          {
            label: "Saved Jobs",
            value: profileStats.savedJobs ?? 0,
            icon: Mail,
            color: "purple",
          },
          {
            label: "Resumes",
            value: profileStats.resumeCount ?? 0,
            icon: FileText,
            color: "orange",
          },
        ].map((stat) => (
          <Card key={stat.label} className="text-center py-4">
            <div
              className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}
            >
              <stat.icon size={20} className={`text-${stat.color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Appearance */}
      <Card className="border border-indigo-100/70 shadow-sm bg-white/90">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Moon size={18} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Appearance
              </h3>
              <p className="text-sm text-gray-500">
                Choose light, dark, or follow system preference
              </p>
            </div>
          </div>
          <div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 theme-dark:bg-gray-800 theme-dark:text-gray-100 theme-dark:border-gray-700"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Notifications Settings */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell size={20} className="text-indigo-600" />
          Notification Preferences
        </h3>
        <div className="space-y-3">
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
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div>
                <h4 className="font-medium text-gray-900">{item.label}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={() => toggleNotification(item.key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Menu Items */}
      <Card noPadding>
        <div className="divide-y divide-gray-100">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left theme-dark:hover:bg-gray-800"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <item.icon
                  size={20}
                  className="text-gray-600 theme-dark:text-gray-200"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 theme-dark:text-gray-100">
                    {item.label}
                  </h4>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full theme-dark:bg-indigo-900/40 theme-dark:text-indigo-200">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 theme-dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              <ChevronRight
                size={20}
                className="text-gray-400 theme-dark:text-gray-300"
              />
            </button>
          ))}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-100 bg-red-50/30">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-600 mb-4">
          Once you delete your account, there is no going back. All your data
          will be permanently removed.
        </p>
        <Button variant="danger">Delete Account</Button>
      </Card>
    </div>
  );
}
