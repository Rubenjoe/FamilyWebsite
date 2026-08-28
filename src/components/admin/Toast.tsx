"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, closeToast };
}

export default function Toast({ messages, onClose }: ToastProps) {
  useEffect(() => {
    const timers = messages.map((toast) =>
      setTimeout(() => onClose(toast.id), 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [messages, onClose]);

  return (
    <div className="fixed top-24 right-6 z-50 space-y-2">
      {messages.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-3 shadow-xl text-xs font-medium tracking-wide border ${
            toast.type === "success"
              ? "bg-[#1b3622] text-[#fbf9f4] border-[#d4af37]/30"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-[#d4af37]" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => onClose(toast.id)}
            className="ml-2 opacity-70 hover:opacity-100"
            aria-label="Close notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
