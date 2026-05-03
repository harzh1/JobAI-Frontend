import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

const getSystemTheme = () =>
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    return stored || "system";
  });

  const resolvedTheme = useMemo(() => {
    if (theme === "system") return getSystemTheme();
    return theme;
  }, [theme]);

  // Apply class to document element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(resolvedTheme === "dark" ? "theme-dark" : "theme-light");
    localStorage.setItem("theme", theme);
  }, [theme, resolvedTheme]);

  // Keep in sync with system changes when in system mode
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setTheme("system");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
