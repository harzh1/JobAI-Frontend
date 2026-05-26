import React from "react";

const NavItem = ({ icon, label, id, view, setView, collapsed = false }) => {
  const isActive = view === id;
  const iconWeight = isActive ? "fill" : "regular";

  return (
    <button
      onClick={() => setView(id)}
      title={collapsed ? label : undefined}
      className={`relative flex items-center transition-all duration-200 group rounded-full ${
        collapsed
          ? "justify-center h-10 w-10 mx-auto"
          : "w-full gap-3 pl-4 pr-3 h-[40px]"
      } ${
        isActive
          ? "bg-[var(--nav-active-bg)] text-[var(--text-primary)]"
          : "text-[var(--muted)] hover:bg-[var(--surface-border)] hover:text-[var(--text-primary)]"
      }`}
    >
      <span className="flex items-center justify-center">
        {React.createElement(icon, {
          size: 20,
          weight: iconWeight,
        })}
      </span>
      {!collapsed && (
        <span className={`flex-1 min-w-0 flex items-center text-left text-[14px] ${isActive ? "font-semibold" : "font-medium"}`}>
          <span className="block truncate mt-[2px]">{label}</span>
        </span>
      )}
      
    </button>
  );
};

export default NavItem;
