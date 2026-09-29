import React from "react";
import {
  Bell,
  List,
} from "@phosphor-icons/react";
import { Button } from "../ui/UIComponents";
import { useTheme } from "../../context/ThemeContext";

export default function Header({
  view,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
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
        <Button variant="ghost" className="relative p-2 rounded-full">
          <Bell size={20} weight="regular" className="text-gray-800 opacity-80" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--page-bg)]"></span>
        </Button>
      </div>
    </header>
  );
}
