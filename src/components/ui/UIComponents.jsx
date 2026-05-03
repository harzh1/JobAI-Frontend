import React from "react";

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full w-full p-12">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
  </div>
);

export const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  icon: Icon,
  disabled,
  type = "button",
  ...props
}) => {
  const baseStyle =
    "px-6 py-3 rounded-md font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-gray-900 text-white hover:bg-black shadow-md shadow-black/15 theme-dark:bg-indigo-500 theme-dark:hover:bg-indigo-400 theme-dark:shadow-md theme-dark:shadow-black/55",
    secondary:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm theme-dark:bg-gray-800 theme-dark:text-gray-100 theme-dark:border-gray-700 theme-dark:hover:bg-gray-750",
    copilot:
      "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-black/20 hover:shadow-black/25 theme-dark:shadow-md theme-dark:shadow-black/55",
    ghost:
      "text-gray-500 hover:bg-gray-100 hover:text-gray-900 theme-dark:text-gray-200 theme-dark:hover:bg-gray-800",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && (
        <Icon size={16} className={variant === "ghost" ? "opacity-70" : ""} />
      )}
      {children}
    </button>
  );
};

export const Card = ({ children, className = "", noPadding = false }) => (
  <div
    className={`card bg-white rounded-lg border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${
      noPadding ? "" : "p-6"
    } ${className}`}
  >
    {children}
  </div>
);

export const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    red: "bg-red-50 text-red-700 border-red-100",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-sm text-[11px] font-bold border ${
        colors[color] || colors.blue
      }`}
    >
      {children}
    </span>
  );
};
