// src/app/redirect-after-login/page.js
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function RedirectAfterLogin() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const token = search.get("token");
    const mode = search.get("mode") || "login";

    if (!token) {
      router.replace("/login");
      return;
    }

    // Save token
    localStorage.setItem("lifelink_token", token);

    // Load user from backend
    fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          toast.error("Login failed");
          router.replace("/login");
          return;
        }

        localStorage.setItem("lifelink_user", JSON.stringify(data.user));

        // 👇 Decide target based on mode
        if (mode === "signup") {
          router.replace("/complete-profile");
        } else {
          router.replace("/dashboard");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Login error");
        router.replace("/login");
      });
  }, []);

  return null;
}
