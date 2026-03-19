import { useState, useEffect, useRef } from "react";
import { Globe } from "lucide-react";
import { f } from "./shared/theme";
import { useTheme } from "./shared/ThemeContext";

const INTRO_KEY   = "atlas-intro-session";
const DURATION_MS = 5200;

export function hasSeenIntro() {
  try { return sessionStorage.getItem(INTRO_KEY) === "1"; }
  catch { return false; }
}

function markIntroDone() {
  try { sessionStorage.setItem(INTRO_KEY, "1"); } catch { /* quota */ }
}

// Format today's date like a broadsheet masthead
function mastheadDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export default function IntroScreen({ onEnter }) {
  const { theme, isDark } = useTheme();
  const [progress,  setProgress]  = useState(0);
  const [exiting,   setExiting]   = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const enteredRef = useRef(false);

  function enter() {
    if (enteredRef.current) return;
    enteredRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    markIntroDone();
    setExiting(true);
    setTimeout(onEnter, 420);
  }

  // Progress line RAF
  useEffect(() => {
    startRef.current = performance.now();
    function tick() {
      const elapsed = performance.now() - startRef.current;
      const p = Math.min(elapsed / DURATION_MS, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        enter();
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Click or any key to skip
  useEffect(() => {
    const onKey = (e) => { if (e.key !== "Tab" && e.key !== "Shift") enter(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stagger = (delay) => ({
    animation: `introFadeUp 0.9s ${delay}s cubic-bezier(0.16, 1, 0.3, 1) both`,
  });

  return (
    <div
      onClick={enter}
      role="dialog"
      aria-label="Atlas Report intro — click to enter"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: theme.bg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.42s cubic-bezier(0.4, 0, 1, 1)",
        userSelect: "none",
        overflow: "hidden",
      }}
    >

      {/* ── Corner date stamp (top-left) ── */}
      <div style={{
        position: "absolute", top: 28, left: 32,
        fontFamily: f.sans, fontSize: 9, color: theme.rule,
        letterSpacing: "0.13em", textTransform: "uppercase",
        animation: "introFadeIn 1.2s 0.7s ease both",
      }}>
        {mastheadDate()}
      </div>

      {/* ── Corner edition (top-right) ── */}
      <div style={{
        position: "absolute", top: 28, right: 32,
        fontFamily: f.sans, fontSize: 9, color: theme.rule,
        letterSpacing: "0.13em", textTransform: "uppercase",
        animation: "introFadeIn 1.2s 0.7s ease both",
      }}>
        Global Edition
      </div>

      {/* ── Vertical rule — left side decoration ── */}
      <div style={{
        position: "absolute", left: 32, top: "50%",
        transform: "translateY(-50%)",
        width: 1, height: "28vh",
        background: `linear-gradient(to bottom, transparent, ${theme.border}, transparent)`,
        animation: "introFadeIn 1.5s 0.5s ease both",
      }} />
      <div style={{
        position: "absolute", right: 32, top: "50%",
        transform: "translateY(-50%)",
        width: 1, height: "28vh",
        background: `linear-gradient(to bottom, transparent, ${theme.border}, transparent)`,
        animation: "introFadeIn 1.5s 0.5s ease both",
      }} />

      {/* ── Center content ── */}
      <div style={{ textAlign: "center", padding: "0 48px", maxWidth: 640 }}>

        {/* Globe icon */}
        <div style={{ ...stagger(0.1), display: "inline-block", marginBottom: 28 }}>
          <Globe
            size={36} strokeWidth={1.0}
            color={theme.ink}
            style={{ display: "block" }}
          />
        </div>

        {/* Thin rule above title */}
        <div style={{
          ...stagger(0.18),
          width: 40, height: 1,
          background: theme.rule,
          margin: "0 auto 20px",
        }} />

        {/* Masthead title */}
        <h1 style={{
          ...stagger(0.26),
          fontFamily: f.display,
          fontSize: "clamp(44px, 9vw, 84px)",
          fontWeight: 400,
          color: theme.ink,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          marginBottom: 18,
        }}>
          The Atlas Report
        </h1>

        {/* Tagline */}
        <p style={{
          ...stagger(0.44),
          fontFamily: f.body,
          fontSize: "clamp(13px, 2vw, 16px)",
          color: theme.dim,
          letterSpacing: "0.01em",
          lineHeight: 1.6,
          fontStyle: "italic",
          marginBottom: 52,
        }}>
          Worldwide intelligence. One report.
        </p>

        {/* Click hint */}
        <p style={{
          ...stagger(0.62),
          fontFamily: f.sans,
          fontSize: 9,
          color: theme.rule,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}>
          — click anywhere to enter —
        </p>
      </div>

      {/* ── Progress line — bottom edge ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 2,
        background: theme.border,
      }}>
        <div style={{
          height: "100%",
          width: `${progress * 100}%`,
          background: theme.accent,
          // No CSS transition — driven by RAF for smoothness
        }} />
      </div>

      {/* ── Subtle dot grid pattern for texture ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `radial-gradient(circle, ${isDark ? "rgba(232,228,221,0.03)" : "rgba(26,26,26,0.03)"} 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        zIndex: -1,
      }} />
    </div>
  );
}
