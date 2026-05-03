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
      className={`fixed md:relative inset-y-0 left-0 z-40 h-screen min-h-screen border-r border-slate-200/80 bg-white theme-dark:bg-slate-950 theme-dark:border-slate-800 flex flex-col transition-[transform,width] duration-300 ease-out flex-shrink-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } ${
        isCollapsed ? "md:w-20" : "md:w-[248px]"
      } w-[260px] md:translate-x-0`}
    >
      <div className={`flex flex-col h-full ${isCollapsed ? "px-2 py-5" : "px-4 py-5"}`}>
        <div
          className={`flex items-center h-7 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight text-slate-900 leading-none theme-dark:text-white">
                JobAI
              </h1>
            </div>
          )}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`hidden md:flex items-center justify-center h-10 w-10 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all theme-dark:text-slate-400 theme-dark:hover:bg-white/5 theme-dark:hover:text-white ${
                isCollapsed ? "" : "rotate-180"
              }`}
              aria-label="Toggle sidebar collapse"
            >
              <SidebarSimple size={20} weight="regular" />
            </button>
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>
        <div className="mx-auto my-4 h-px w-full max-w-[calc(100%-1.5rem)] bg-slate-200 theme-dark:bg-slate-800" />
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
            id="tracker"
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
        <div className="mx-auto my-4 h-px w-full max-w-[calc(100%-1.5rem)] bg-slate-200 theme-dark:bg-slate-800" />
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
        className={`mt-auto border-t border-slate-200 theme-dark:border-slate-800 ${
          isCollapsed ? "p-2" : "p-3"
        }`}
      >
        <button
          onClick={() => setView("user-profile")}
          title={isCollapsed ? "Profile" : undefined}
          className={`w-full text-left rounded-lg transition-colors hover:bg-slate-100 theme-dark:hover:bg-white/5 ${
            isCollapsed
              ? "flex items-center justify-center h-11"
              : "flex items-center gap-3 px-2.5 py-2.5"
          }`}
        >
          <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-semibold theme-dark:bg-white theme-dark:text-slate-900">
            {user && user.displayName ? user.displayName.charAt(0) : "?"}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate theme-dark:text-slate-100">
                {user?.displayName ?? "Guest User"}
              </p>
              <p className="text-xs text-slate-400 truncate">Pro Plan</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
