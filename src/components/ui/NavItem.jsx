import React from "react";

const NavItem = ({ icon, label, id, view, setView, collapsed = false }) => {
  const isActive = view === id;
  const iconWeight = isActive ? "fill" : "regular";

  return (
    <button
      onClick={() => setView(id)}
      title={collapsed ? label : undefined}
      className={`relative w-full flex items-center transition-all duration-200 group ${
        collapsed
          ? "justify-center h-11 rounded-lg"
          : "gap-3 px-3 h-11 rounded-lg"
      } ${
        isActive
          ? "bg-indigo-50 text-indigo-700 theme-dark:bg-indigo-500/15 theme-dark:text-indigo-200"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 theme-dark:text-slate-300 theme-dark:hover:bg-white/5 theme-dark:hover:text-white"
      }`}
    >
      <span className="flex items-center justify-center">
        {React.createElement(icon, {
          size: 20,
          weight: iconWeight,
        })}
      </span>
      {!collapsed && (
        <span className="flex-1 min-w-0 text-left text-[14px] font-medium leading-none">
          <span className="block truncate">{label}</span>
        </span>
      )}
      {collapsed && isActive && (
        <span className="absolute -right-2 h-5 w-1 rounded-full bg-indigo-500 theme-dark:bg-indigo-300 md:block" />
      )}
    </button>
  );
};

export default NavItem;
