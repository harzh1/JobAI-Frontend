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
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm border-b border-gray-200/50 flex-shrink-0 z-20 theme-dark:bg-gray-950/70 theme-dark:border-gray-900">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <Button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          variant="ghost"
          icon={List}
          className="md:hidden p-2 rounded-md"
          aria-label="Toggle mobile menu"
        />
        <h2 className="text-base sm:text-lg font-bold text-gray-800 capitalize truncate">
          {view === "referrals"
            ? "Network Intelligence"
            : view.replace("-", " ")}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div
          className="hidden lg:flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-1.5 shadow-sm hover:border-indigo-300 transition-colors cursor-pointer"
          onClick={() => setShowAIModal(true)}
        >
          <Sparkle size={14} weight="fill" className="text-indigo-500" />
          <span className="text-sm font-medium text-gray-600">
            Ask Copilot...
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md ml-2">
            ⌘K
          </span>
        </div>
        <Button variant="ghost" className="relative p-2">
          <Bell size={20} weight="duotone" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>
      </div>
    </header>
  );
}
