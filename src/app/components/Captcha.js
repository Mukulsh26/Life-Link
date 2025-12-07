"use client";

import { useEffect } from "react";

export default function Captcha({ onVerify }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!window.grecaptcha) return;

    window.grecaptcha.ready(() => {
      window.grecaptcha.render("captcha-container", {
        sitekey: siteKey,
        callback: onVerify, // token returned here
      });
    });
  }, []);

  return (
    <div className="mt-4">
      <div id="captcha-container"></div>
    </div>
  );
}
