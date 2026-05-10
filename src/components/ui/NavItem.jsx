import React from "react";

const NavItem = ({ icon, label, id, view, setView, collapsed = false }) => {
  const isActive = view === id;
  const iconWeight = isActive ? "fill" : "regular";

  return (
    <button
      onClick={() => setView(id)}
      title={collapsed ? label : undefined}
      className={`relative w-full flex items-center transition-all duration-200 group border-l-[3px] ${
        collapsed
          ? "justify-center h-11"
          : "gap-3 pl-3 pr-2 h-11"
      } ${
        isActive
          ? "bg-gray-100 text-gray-900 border-[#3442FF]"
          : "text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-900"
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
      
    </button>
  );
};

export default NavItem;
