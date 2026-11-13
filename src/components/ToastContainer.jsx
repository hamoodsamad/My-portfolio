import React from "react";

export default function ToastContainer({ toasts }) {
  return (
    <div id="toast-container" className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-item ${
            toast.type === "error" ? "toast-item-error" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-accentCyan font-mono">◆</span>
            <span>{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
