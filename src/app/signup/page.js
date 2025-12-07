"use client";

import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Button from "../components/Button";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLoader } from "../context/LoaderContext";
import { motion, AnimatePresence } from "framer-motion";

const SignupSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignupPage() {
  const router = useRouter();
  const { setLoading } = useLoader();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [captchaId, setCaptchaId] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(SignupSchema),
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

    // callback function Google calls
    window.recaptchaLoadSignup = () => {
      if (!window.grecaptcha) return;

      // avoid double render
      if (captchaId !== null) return;

      const container = document.getElementById("recaptcha-container-signup");

      if (container && container.children.length > 0) return;

      const id = window.grecaptcha.render("recaptcha-container-signup", {
        sitekey: siteKey,
      });

      setCaptchaId(id);
    };

    // if script already loaded
    if (window.grecaptcha) {
      window.recaptchaLoadSignup();
      return;
    }

    // add script once
    const existingScript = document.querySelector(
      'script[src^="https://www.google.com/recaptcha/api.js"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://www.google.com/recaptcha/api.js?onload=recaptchaLoadSignup&render=explicit";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [captchaId]);

  // ---------- GOOGLE ERROR HANDLING ----------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error === "already_exists") toast.error("Account already exists.");
    if (error === "no_account") toast.error("No account found.");

    if (error) resetCaptcha();

    window.history.replaceState({}, "", "/signup");
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

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, captchaToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Signup failed");
        resetCaptcha(); // reset on error
        return;
      }

      localStorage.setItem("lifelink_token", data.token);
      localStorage.setItem("lifelink_user", JSON.stringify(data.user));

      router.push("/complete-profile");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // ---------- GOOGLE SIGNUP ----------
  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    setLoading(true);
    window.location.href = "/api/auth/google?mode=signup";
  };

  return (
  <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden">

    {/* Soft glowing background */}
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-700/20 blur-[200px] -z-10" />
    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-800/10 blur-[200px] -z-10" />

    <Navbar />

    <div className="flex justify-center items-start pt-20 pb-10 min-h-screen px-4">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-900/40 backdrop-blur-xl border border-slate-800
        rounded-2xl shadow-2xl shadow-red-900/20 p-6 md:p-8 w-full max-w-md"
      >

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-center 
        bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
          Create Your Account
        </h2>

        <p className="text-center text-slate-400 text-sm mt-3 mb-8">
          Join the LifeLink network and save lives.
        </p>

        {/* GOOGLE SIGNUP */}
        <button
          onClick={handleGoogleSignup}
          disabled={googleLoading}
          className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-3
          border border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 
          hover:from-slate-800 hover:to-slate-700 transition-all text-white mb-4
          shadow-lg hover:shadow-red-900/30 active:scale-95
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
          {googleLoading ? "Connecting..." : "Sign up with Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-slate-700"></div>
          <span className="px-3 text-slate-500 text-sm">OR</span>
          <div className="flex-grow h-px bg-slate-700"></div>
        </div>

        {/* EMAIL FORM */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Name */}
          <div>
            <Input label="Full Name" {...register("name")} />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Input type="email" label="Email" {...register("email")} />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <Input type="password" label="Password" {...register("password")} />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* reCAPTCHA (smaller size) */}
          <div className="mt-2 flex justify-center scale-90 origin-top">
            <div id="recaptcha-container-signup"></div>
          </div>

          {/* Button */}
          <button
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700
            shadow-lg shadow-red-900/40 text-lg font-semibold transition-all
            active:scale-95"
          >
            {isSubmitting ? "Creating account..." : "Sign up with Email"}
          </button>
        </form>

        {/* Login Redirect */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-red-400 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  </main>
);

}
