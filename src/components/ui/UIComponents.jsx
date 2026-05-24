import React from "react";

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full w-full p-12">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3442FF]"></div>
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
    "px-6 py-3 rounded-full font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-[var(--primary-blue)] text-white hover:brightness-95 transition-colors shadow-none",
    secondary:
      "bg-transparent border border-[var(--surface-border)] text-gray-700 hover:bg-black/5 shadow-none",
    copilot:
      "gemini-bg-gradient text-white shadow-sm hover:shadow-md",
    ghost:
      "text-gray-500 hover:bg-black/5 hover:text-gray-900 border-none",
    danger: "bg-transparent text-red-600 hover:bg-red-50 border border-red-200 shadow-none",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${
        variant === "primary" ? "primary" : ""
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && (
        <Icon size={18} className={variant === "ghost" ? "opacity-70" : ""} />
      )}
      {children}
    </button>
  );
};

export const Card = ({ children, className = "", noPadding = false }) => (
  <div
    className={`bg-[var(--surface-bg)] rounded-[1.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden ${
      noPadding ? "" : "p-5"
    } ${className}`}
  >
    {children}
  </div>
);

export const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-none",
    purple: "bg-purple-50 text-purple-700 border-none",
    green: "bg-emerald-50 text-emerald-700 border-none",
    gray: "bg-gray-100 text-gray-600 border-none",
    orange: "bg-orange-50 text-orange-700 border-none",
    red: "bg-red-50 text-red-700 border-none",
  };
  return (
    <span
      className={`gemini-pill text-[11px] font-medium tracking-wide ${
        colors[color] || colors.blue
      }`}
    >
      {children}
    </span>
  );
};
