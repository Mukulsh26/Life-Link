"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Button from "../components/Button";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
  toast.error(data.error || "Invalid credentials");
  return;
}

toast.success("Logged in successfully!");

// SAVE TOKEN + USER
localStorage.setItem("lifelink_token", data.token);
localStorage.setItem("lifelink_user", JSON.stringify(data.user));

setTimeout(() => {
  router.push("/dashboard");
}, 500);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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

          <form className="space-y-4" onSubmit={submit}>
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />

            <Button className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-center text-xs text-slate-400 mt-3">
              New here?{" "}
              <span
                onClick={() => router.push("/register")}
                className="text-red-400 hover:underline cursor-pointer"
              >
                Create an account
              </span>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
