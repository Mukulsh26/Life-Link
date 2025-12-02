"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Button from "../components/Button";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("donor");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    city: "",
    bloodGroup: "",
    hospitalName: "",
    contactNumber: "",
  });

  const [loading, setLoading] = useState(false);

  const update = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const payload = { ...form, role };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      toast.success("Registration successful!");
      router.push("/login");
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

      <div className="max-w-lg mx-auto px-4 pt-10 pb-12">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Create an account
          </h2>
          <p className="text-center text-slate-400 text-sm mb-6">
            Join LifeLink {role === "donor" ? "as a donor" : "as a hospital"}.
          </p>

          {/* ROLE SELECTOR */}
          <div className="flex gap-3 text-xs mb-6">
            <button
              type="button"
              onClick={() => setRole("donor")}
              className={`flex-1 p-2 rounded-lg border transition ${
                role === "donor"
                  ? "border-red-500 bg-red-500/20 text-red-200"
                  : "border-slate-700 text-slate-300"
              }`}
            >
              Donor
            </button>

            <button
              type="button"
              onClick={() => setRole("hospital")}
              className={`flex-1 p-2 rounded-lg border transition ${
                role === "hospital"
                  ? "border-red-500 bg-red-500/20 text-red-200"
                  : "border-slate-700 text-slate-300"
              }`}
            >
              Hospital
            </button>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            {/* COMMON FIELDS */}
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <Input
              label="Email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              type="email"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
              <Input
                label="Confirm Password"
                type="password"
                value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)}
              />
            </div>

            {/* DONOR FIELDS */}
            {role === "donor" && (
  <>
    <Input
      label="City"
      value={form.city}
      onChange={(e) => update("city", e.target.value)}
    />

    <Input
      label="Mobile Number"
      type="tel"
      maxLength={10}
      value={form.contactNumber}
      onChange={(e) => {
        const value = e.target.value.replace(/\D/g, ""); // only numbers
        update("contactNumber", value);
      }}
    />

    {/* BLOOD GROUP DROPDOWN */}
    <div className="text-sm flex flex-col">
      <label className="text-slate-300 mb-1">Blood Group</label>
      <select
        value={form.bloodGroup}
        onChange={(e) => update("bloodGroup", e.target.value)}
        className="border border-slate-700 bg-slate-800 p-2 rounded text-white"
      >
        <option value="">Select Blood Group</option>
        <option value="A+">A+</option>
        <option value="A-">A-</option>
        <option value="B+">B+</option>
        <option value="B-">B-</option>
        <option value="O+">O+</option>
        <option value="O-">O-</option>
        <option value="AB+">AB+</option>
        <option value="AB-">AB-</option>
      </select>
    </div>
  </>
)}


            {/* HOSPITAL FIELDS */}
            {role === "hospital" && (
              <>
                <Input
                  label="Hospital Name"
                  value={form.hospitalName}
                  onChange={(e) => update("hospitalName", e.target.value)}
                />
                <Input
                  label="City"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
                <Input
                  label="Contact Number"
                  value={form.contactNumber}
                  onChange={(e) => update("contactNumber", e.target.value)}
                />
              </>
            )}

            <Button className="w-full mt-2" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>

            <p className="text-center text-xs text-slate-400 mt-3">
              Already have an account?{" "}
              <span
                onClick={() => router.push("/login")}
                className="text-red-400 hover:underline cursor-pointer"
              >
                Login
              </span>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
