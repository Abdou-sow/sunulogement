import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

const ICONS = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
const COLORS = {
  success: { bg: "#e8f5e9", border: "#4caf50", text: "#1b5e20" },
  error:   { bg: "#fdecea", border: "#f44336", text: "#b71c1c" },
  warning: { bg: "#fff8e1", border: "#ff9800", text: "#e65100" },
  info:    { bg: "#e3f2fd", border: "#1976d2", text: "#0d47a1" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={add}>
      {children}
      <div style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 10,
        maxWidth: 360, width: "calc(100vw - 48px)",
      }}>
        {toasts.map((t) => {
          const c = COLORS[t.type] || COLORS.info;
          return (
            <div key={t.id} style={{
              background: c.bg, border: `1px solid ${c.border}`, color: c.text,
              borderRadius: 10, padding: "13px 16px",
              display: "flex", alignItems: "flex-start", gap: 10,
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              animation: "toastIn 0.2s ease",
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{ICONS[t.type]}</span>
              <span style={{ flex: 1, fontSize: 14, lineHeight: 1.5 }}>{t.message}</span>
              <button onClick={() => remove(t.id)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: c.text, fontSize: 16, opacity: 0.6, padding: 0, flexShrink: 0,
              }}>✕</button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};
