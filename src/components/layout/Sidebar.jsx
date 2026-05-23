import React from "react";
import {
  CardsThree,
  Checks,
  FileText,
  House,
  NotePencil,
  PaperPlaneTilt,
  ShareNetwork,
  SidebarSimple,
  SuitcaseSimple,
  X,
} from "@phosphor-icons/react";
import NavItem from "../ui/NavItem";
// import { Logo } from "../ui/Logo";
import logo from "../../assets/logo.svg";

export default function Sidebar({
  view,
  setView,
  isSidebarOpen,
  isCollapsed,
  onCloseMobile,
  onToggleCollapse,
  user,
}) {
  return (
    <aside
      className={`fixed md:relative inset-y-0 left-0 z-40 h-screen min-h-screen border-r md:border-transparent border-[var(--surface-border)] bg-[var(--sidebar-bg)] flex flex-col transition-[transform,width] duration-300 ease-out flex-shrink-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } ${
        isCollapsed ? "md:w-20" : "md:w-[248px]"
      } w-[260px] md:translate-x-0`}
    >
      <div className={`flex flex-col h-full ${isCollapsed ? "px-2 py-5" : "px-3 py-5"}`}>
        <div
          className={`flex items-center h-12 ${
            isCollapsed ? "justify-center" : "justify-between pl-3 pr-1"
          }`}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-24 text-[var(--text-primary)]">
                <img src={logo} alt="JobBot Logo" className="w-full h-auto drop-shadow-sm opacity-80" />
              </div>
            </div>
          )}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`hidden md:flex items-center justify-center h-10 w-10 rounded-full text-[var(--text-primary)] opacity-60 hover:opacity-100 hover:bg-black/5 transition-all ${
                isCollapsed ? "" : "rotate-180"
              }`}
              aria-label="Toggle sidebar collapse"
            >
              <SidebarSimple size={20} weight="regular" />
            </button>
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-full text-[var(--text-primary)] opacity-60 hover:opacity-100 hover:bg-black/5 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>
        <div className="mx-auto my-3 h-[1px] w-full max-w-[calc(100%-1.5rem)] bg-[var(--surface-border)] opacity-60" />
        <nav className="space-y-1.5">
          <NavItem
            icon={House}
            label="Dashboard"
            id="dashboard"
            view={view}
            setView={setView}
            collapsed={isCollapsed}
          />
          <NavItem
            icon={SuitcaseSimple}
            label="Find Jobs"
            id="jobs"
            view={view}
            setView={setView}
            collapsed={isCollapsed}
          />
          <NavItem
            icon={Checks}
            label="Applications"
            id="applications"
            view={view}
            setView={setView}
            collapsed={isCollapsed}
          />
          <NavItem
            icon={PaperPlaneTilt}
            label="Email Campaigns"
            id="campaigns"
            view={view}
            setView={setView}
            collapsed={isCollapsed}
          />
        </nav>
        <div className="mx-auto my-3 h-[1px] w-full max-w-[calc(100%-1.5rem)] bg-[var(--surface-border)] opacity-60" />
        <nav className="space-y-1.5">
          <NavItem
            icon={CardsThree}
            label="All Details"
            id="all-details"
            view={view}
            setView={setView}
            collapsed={isCollapsed}
          />
          <NavItem
            icon={FileText}
            label="Resumes"
            id="resumes"
            view={view}
            setView={setView}
            collapsed={isCollapsed}
          />
          <NavItem
            icon={ShareNetwork}
            label="Network"
            id="referrals"
            view={view}
            setView={setView}
            collapsed={isCollapsed}
          />
          <NavItem
            icon={NotePencil}
            label="Notes & Tasks"
            id="notes"
            view={view}
            setView={setView}
            collapsed={isCollapsed}
          />
        </nav>
      </div>

      <div
        className={`mt-auto border-t border-[var(--surface-border)] ${
          isCollapsed ? "p-2" : "p-3"
        }`}
      >
        <button
          onClick={() => setView("user-profile")}
          title={isCollapsed ? "Profile" : undefined}
          className={`w-full text-left rounded-full transition-colors hover:bg-black/5 theme-dark:hover:bg-white/5 ${
            isCollapsed
              ? "flex items-center justify-center h-11"
              : "flex items-center gap-3 px-3 py-2.5"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#f0f4f9] group-hover:bg-white flex items-center justify-center border border-[var(--surface-border)] text-[#1f1f1f] text-xs font-semibold theme-dark:bg-[#1e1f20] theme-dark:border-[#333538] theme-dark:text-[#e3e3e3]">
            {user && user.displayName ? user.displayName.charAt(0) : "?"}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {user?.displayName ?? "Guest User"}
              </p>
              <p className="text-xs text-[var(--icon-color)] truncate">Pro Plan</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
