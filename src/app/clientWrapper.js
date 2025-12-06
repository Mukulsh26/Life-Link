"use client";

import { LoaderProvider } from "./context/LoaderContext";
import GlobalLoader from "./components/GlobalLoader";
import { ToastProvider } from "./components/ToastProvider";

export default function ClientWrapper({ children }) {
  return (
    <LoaderProvider>
      <GlobalLoader />
      <ToastProvider />
      {children}
    </LoaderProvider>
  );
}
