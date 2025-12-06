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
import { useLoader } from "../context/LoaderContext";  // ✅ ADD THIS

// Zod validation
const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const { setLoading } = useLoader(); // ✅ GLOBAL LOADER

  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  // ----------------------------------------
  // EMAIL LOGIN
  // ----------------------------------------
  const onSubmit = async (values) => {
    try {
      setLoading(true); // ✅ SHOW LOADER

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid credentials");
        return;
      }

      // Save token + user locally
      localStorage.setItem("lifelink_token", data.token);
      localStorage.setItem("lifelink_user", JSON.stringify(data.user));

      toast.success("Logged in successfully");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false); // ✅ HIDE LOADER
    }
  };

  // ----------------------------------------
  // GOOGLE LOGIN
  // ----------------------------------------
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setLoading(true); // ✅ SHOW LOADER globally
    window.location.href = "/api/auth/google?mode=login";
  };

  // ----------------------------------------
  // HANDLE GOOGLE ERROR
  // ----------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error) {
      if (error === "already_exists") {
        toast.error("Account already exists. Please login.");
      }

      window.history.replaceState({}, "", "/login");
    }
  }, []);



  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="flex justify-center items-center min-h-[80vh] px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-md">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Welcome!
          </h2>

          <p className="text-center text-slate-400 text-sm mb-6">
            Login to manage requests or donate blood.
          </p>

          {/* GOOGLE LOGIN */}
          <button
            onClick={handleGoogleLogin}
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
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-slate-700"></div>
            <span className="px-2 text-slate-400 text-sm">OR</span>
            <div className="flex-grow h-px bg-slate-700"></div>
          </div>

          {/* EMAIL FORM */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input label="Email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Input label="Password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login with Email"}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-4">
            New here?{" "}
            <span
              onClick={() => router.push("/signup")}
              className="text-red-400 hover:underline cursor-pointer"
            >
              Create an account
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
