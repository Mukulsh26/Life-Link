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

// --------------------------
// ✅ ZOD VALIDATION SCHEMA
// --------------------------
const SignupSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignupPage() {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(SignupSchema),
  });

  // Show clean errors from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error === "already_exists") {
      toast.error("Account already exists. Please login.");
    }
    if (error === "no_account") {
      toast.error("No account found. Please create one.");
    }

    window.history.replaceState({}, "", "/signup");
  }, []);

  // --------------------------
  // 🔥 GOOGLE SIGNUP
  // --------------------------
  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    window.location.href = "/api/auth/google?mode=signup";
  };

  // --------------------------
  // ✨ EMAIL SIGNUP HANDLER
  // --------------------------
  const onSubmit = async (values) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      // save token + user
      localStorage.setItem("lifelink_token", data.token);
      localStorage.setItem("lifelink_user", JSON.stringify(data.user));

      router.push("/complete-profile");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Fix: spacing so card does NOT touch navbar */}
      <div className="flex justify-center items-start pt-16 pb-10 min-h-screen px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-md">

          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Create your LifeLink Account
          </h2>

          <p className="text-center text-slate-400 text-sm mb-6">
            Sign up using Google or Email.
          </p>

          {/* GOOGLE SIGNUP */}
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-3
            border border-slate-700 bg-slate-900 hover:bg-slate-800
            transition-all text-white mb-4
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
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-slate-700"></div>
            <span className="px-2 text-slate-400 text-sm">OR</span>
            <div className="flex-grow h-px bg-slate-700"></div>
          </div>

          {/* EMAIL SIGNUP FORM */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* FULL NAME */}
            <div>
              <Input label="Full Name" {...register("name")} />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <Input type="email" label="Email" {...register("email")} />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <Input type="password" label="Password" {...register("password")} />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign up with Email"}
            </Button>
          </form>

          {/* Redirect */}
          <p className="text-center text-xs text-slate-400 mt-4">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-red-400 hover:underline cursor-pointer"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
