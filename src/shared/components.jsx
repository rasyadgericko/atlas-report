import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { f } from "./theme";

// ─── Select Component ───
export function Select({ value, onChange, options, renderOption, label, theme }) {
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const ref = useRef(null);
  const listRef = useRef(null);
  const selected = options.find(o => (o.code || o.id) === value);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  // Reset focus index when dropdown opens
  const openDropdown = useCallback(() => {
    const idx = options.findIndex(o => (o.code || o.id) === value);
    setFocusIdx(idx >= 0 ? idx : 0);
    setOpen(true);
  }, [options, value]);

  // Scroll focused item into view
  useEffect(() => {
    if (!open || focusIdx < 0 || !listRef.current) return;
    const items = listRef.current.children;
    if (items[focusIdx]) {
      items[focusIdx].scrollIntoView({ block: "nearest" });
    }
  }, [focusIdx, open]);

  const handleKeyDown = useCallback((e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusIdx(prev => Math.min(prev + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIdx(prev => Math.max(prev - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusIdx >= 0) {
          const opt = options[focusIdx];
          onChange(opt.code || opt.id);
          setOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  }, [open, focusIdx, options, onChange, openDropdown]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => open ? setOpen(false) : openDropdown()}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        style={{
          display: "flex", alignItems: "center", gap: 6, padding: "7px 12px",
          background: "transparent", border: `1px solid ${open ? theme.ink : theme.border}`,
          cursor: "pointer", fontFamily: f.sans, fontSize: 13, fontWeight: 500,
          color: theme.text, minWidth: 140, transition: "border-color 0.15s ease-out",
          whiteSpace: "nowrap",
        }}>
        {renderOption ? renderOption(selected) : selected?.name || label}
        <ChevronDown size={12} color={theme.dim} style={{ marginLeft: "auto",
          transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease-out" }} />
      </button>
      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-label={label}
          onKeyDown={handleKeyDown}
          style={{
            position: "absolute", top: "calc(100% + 2px)", left: 0, minWidth: "100%",
            maxHeight: 340, overflowY: "auto", background: theme.card, border: `1px solid ${theme.border}`,
            boxShadow: "0 6px 24px rgba(0,0,0,0.12)", zIndex: 50,
          }}>
          {options.map((opt, i) => {
            const active = (opt.code || opt.id) === value;
            const focused = i === focusIdx;
            return (
              <button key={opt.code || opt.id}
                role="option"
                aria-selected={active}
                onClick={() => { onChange(opt.code || opt.id); setOpen(false); }}
                onMouseEnter={() => setFocusIdx(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "8px 12px", border: "none", textAlign: "left",
                  background: active ? theme.surface : focused ? theme.surface : "transparent",
                  cursor: "pointer", fontFamily: f.sans, fontSize: 13,
                  fontWeight: active ? 600 : 400, color: active ? theme.ink : theme.text,
                  transition: "background 0.1s ease-out",
                }}>
                {renderOption ? renderOption(opt) : opt.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton Loader ───
export function SkeletonRows({ theme }) {
  const rows = [1, 2, 3, 4, 5];
  return (
    <div aria-busy="true" aria-label="Loading articles">
      {rows.map(i => (
        <div key={i} style={{
          display: "flex", gap: 14, padding: "20px 0",
          borderBottom: `1px solid ${theme.border}`,
        }}>
          <div style={{
            width: 26, height: 28, borderRadius: 2,
            background: theme.skeleton, animation: "shimmer 1.5s infinite",
          }} />
          <div style={{ flex: 1 }}>
            <div style={{
              height: 18, borderRadius: 2, marginBottom: 8,
              width: `${70 + (i * 7) % 25}%`, background: theme.skeleton,
              animation: `shimmer 1.5s ${i * 0.1}s infinite`,
            }} />
            <div style={{
              height: 13, borderRadius: 2, marginBottom: 6,
              width: `${85 + (i * 11) % 15}%`, background: theme.skeleton,
              animation: `shimmer 1.5s ${i * 0.15}s infinite`,
            }} />
            <div style={{
              height: 13, borderRadius: 2, marginBottom: 10,
              width: `${40 + (i * 13) % 30}%`, background: theme.skeleton,
              animation: `shimmer 1.5s ${i * 0.2}s infinite`,
            }} />
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ height: 10, width: 60, borderRadius: 2, background: theme.skeleton, animation: `shimmer 1.5s ${i * 0.25}s infinite` }} />
              <div style={{ height: 10, width: 30, borderRadius: 2, background: theme.skeleton, animation: `shimmer 1.5s ${i * 0.3}s infinite` }} />
            </div>
          </div>
          <div style={{
            width: 88, height: 88, flexShrink: 0, borderRadius: 2,
            background: theme.skeleton, animation: `shimmer 1.5s ${i * 0.1}s infinite`,
          }} />
        </div>
      ))}
    </div>
  );
}
