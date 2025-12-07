"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Button from "../components/Button";
import Input from "../components/Input";
import { useState, useEffect } from "react";
import { useLoader } from "../context/LoaderContext";
import { motion, AnimatePresence } from "framer-motion";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const { setLoading } = useLoader();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [captchaId, setCaptchaId] = useState(null);

  // ---------- FORM ----------
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  // ---------- RESET CAPTCHA ----------
  const resetCaptcha = () => {
    if (window.grecaptcha && captchaId !== null) {
      window.grecaptcha.reset(captchaId);
    }
  };

  // ---------- LOAD reCAPTCHA V2 ----------
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    // Google callback
    window.recaptchaLoadLogin = () => {
      if (!window.grecaptcha) return;

      // Prevent duplicate rendering
      if (captchaId !== null) return;

      const container = document.getElementById("recaptcha-container-login");
      if (!container) return;

      // Prevent rendering twice on hydration
      if (container.children.length > 0) return;

      const id = window.grecaptcha.render("recaptcha-container-login", {
        sitekey: siteKey,
      });

      setCaptchaId(id);
    };

    // If captcha already loaded
    if (window.grecaptcha) {
      window.recaptchaLoadLogin();
      return;
    }

    // Inject script only once
    const existingScript = document.querySelector(
      'script[src^="https://www.google.com/recaptcha/api.js"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://www.google.com/recaptcha/api.js?onload=recaptchaLoadLogin&render=explicit";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [captchaId]);

  // ---------- HANDLE GOOGLE ERROR (auto-reset captcha) ----------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error === "already_exists") {
      toast.error("Account already exists. Please login.");
      resetCaptcha(); // 🔥 Reset captcha
    }

    window.history.replaceState({}, "", "/login");
  }, [captchaId]);

  // ---------- SUBMIT ----------
  const onSubmit = async (values) => {
    try {
      setLoading(true);

      if (!window.grecaptcha) {
        toast.error("Captcha not loaded. Refresh page.");
        return;
      }

      const captchaToken = window.grecaptcha.getResponse(captchaId);

      if (!captchaToken) {
        toast.error("Please complete the captcha.");
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, captchaToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid credentials");

        // 🔥 Reset captcha on failure
        resetCaptcha();
        return;
      }

      // SUCCESS
      localStorage.setItem("lifelink_token", data.token);
      localStorage.setItem("lifelink_user", JSON.stringify(data.user));

      toast.success("Logged in successfully");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");

      // 🔥 Also reset on error
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // ---------- GOOGLE LOGIN ----------
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setLoading(true);
    window.location.href = "/api/auth/google?mode=login";
  };

  return (
  <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden">

    {/* Soft background glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-700/20 blur-[180px] -z-10" />

    <Navbar />

    <div className="flex justify-center items-center min-h-[80vh] px-4">

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-10 mb-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800 
        rounded-2xl shadow-2xl shadow-red-900/20 p-6 md:p-8 w-full max-w-md"
      >

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
          Welcome Back
        </h2>

        <p className="text-center text-slate-400 text-sm mt-2 mb-8">
          Login to continue your life-saving journey.
        </p>

        {/* GOOGLE LOGIN */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className={`w-full py-3 rounded-xl flex items-center justify-center gap-3
          border border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 
          hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg
          hover:shadow-red-900/30 active:scale-95
          ${googleLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {googleLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-400"></div>
          ) : (
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
          )}
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-slate-700"></div>
          <span className="px-3 text-slate-500 text-sm">OR</span>
          <div className="flex-grow h-px bg-slate-700"></div>
        </div>

        {/* EMAIL FORM */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

          <Input label="Email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email.message}</p>
          )}

          <Input label="Password" type="password" {...register("password")} />
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password.message}</p>
          )}

          {/* reCAPTCHA (Smaller Size) */}
          <div className="mt-2 flex justify-center scale-90 origin-top">
            <div id="recaptcha-container-login"></div>
          </div>

          {/* Submit */}
          <button
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700
            shadow-lg shadow-red-900/40 text-lg font-semibold transition-all
            active:scale-95"
          >
            {isSubmitting ? "Logging in..." : "Login with Email"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          New here?{" "}
          <span
            onClick={() => router.push("/signup")}
            className="text-red-400 hover:underline cursor-pointer"
          >
            Create an account
          </span>
        </p>
      </motion.div>
    </div>
  </main>
);

}
