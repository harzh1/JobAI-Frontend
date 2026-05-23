import React from "react";
import {
  Bell,
  List,
  Sparkle,
} from "@phosphor-icons/react";
import { Button } from "../ui/UIComponents";
import { useTheme } from "../../context/ThemeContext";

export default function Header({
  view,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  setShowAIModal,
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-transparent flex-shrink-0 z-20">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <Button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          variant="ghost"
          icon={List}
          className="md:hidden p-2 rounded-full"
          aria-label="Toggle mobile menu"
        />
        <h2 className="text-xl font-medium text-gray-900 capitalize truncate tracking-tight">
          {view === "referrals"
            ? "Network Intelligence"
            : view.replace("-", " ")}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div
          className="hidden lg:flex items-center gap-2 bg-[var(--surface-bg)] rounded-full px-5 py-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-transparent"
          onClick={() => setShowAIModal(true)}
        >
          <div className="gemini-text-gradient"><Sparkle size={16} weight="fill" /></div>
          <span className="text-sm font-medium text-[#444746]">
            Ask Copilot...
          </span>
          <span className="text-xs text-[#444746] bg-[#f0f4f9] px-2 py-0.5 rounded-full ml-3 font-medium">
            ⌘K
          </span>
        </div>
        <Button variant="ghost" className="relative p-2 rounded-full">
          <Bell size={20} weight="regular" className="text-gray-800 opacity-80" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--page-bg)]"></span>
        </Button>
      </div>
    </header>
  );
}
