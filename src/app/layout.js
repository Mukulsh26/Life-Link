// src/app/layout.js
import "./globals.css";
import { ToastProvider } from "./components/ToastProvider";

export const metadata = {
  title: "LifeLink - Blood Donation System",
  description: "A real-time blood donation coordination platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
