"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      richColors
      closeButton
      position="top-right"
      duration={3000}   // 🔥 AUTO-HIDE AFTER 3 SECONDS
      toastOptions={{
        className: "bg-slate-900 text-slate-50 border border-slate-700",
      }}
    />
  );
}
