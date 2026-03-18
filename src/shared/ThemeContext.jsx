/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { lightTheme, darkTheme } from "./theme";

const ThemeContext = createContext();

function isNightTime() {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 18;
}

const OVERRIDE_KEY = "atlas_theme_override";
const OVERRIDE_TS_KEY = "atlas_theme_override_ts";

function getStoredOverride() {
  try {
    const val = localStorage.getItem(OVERRIDE_KEY);
    const ts = localStorage.getItem(OVERRIDE_TS_KEY);
    if (!val || !ts) return null;
    // Override expires after 12 hours (next natural transition)
    if (Date.now() - Number(ts) > 12 * 60 * 60 * 1000) {
      localStorage.removeItem(OVERRIDE_KEY);
      localStorage.removeItem(OVERRIDE_TS_KEY);
      return null;
    }
    return val; // "light" or "dark"
  } catch { return null; }
}

function setStoredOverride(mode) {
  try {
    localStorage.setItem(OVERRIDE_KEY, mode);
    localStorage.setItem(OVERRIDE_TS_KEY, String(Date.now()));
  } catch { /* ignore */ }
}

function clearStoredOverride() {
  try {
    localStorage.removeItem(OVERRIDE_KEY);
    localStorage.removeItem(OVERRIDE_TS_KEY);
  } catch { /* ignore */ }
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const override = getStoredOverride();
    if (override) return override === "dark";
    return isNightTime();
  });

  // Re-check every 60s for automatic transition
  useEffect(() => {
    const interval = setInterval(() => {
      const override = getStoredOverride();
      if (!override) {
        setIsDark(isNightTime());
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      const autoMode = isNightTime() ? "dark" : "light";
      const nextMode = next ? "dark" : "light";
      // If toggling back to what auto would give, clear override
      if (nextMode === autoMode) {
        clearStoredOverride();
      } else {
        setStoredOverride(nextMode);
      }
      return next;
    });
  }, []);

  const theme = isDark ? darkTheme : lightTheme;

  // Sync body background and meta theme-color for smooth transitions
  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme.bg);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
