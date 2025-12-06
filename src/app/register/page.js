"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Button from "../components/Button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// -----------------------------
// ⭐ ZOD VALIDATION SCHEMAS
// -----------------------------
const donorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm: z.string(),
  city: z.string().min(2, "City is required"),
  contactNumber: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  bloodGroup: z.string().min(1, "Select a blood group"),
});

const hospitalSchema = z.object({
  name: z.string().min(2, "Contact person's name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm: z.string(),
  hospitalName: z.string().min(2, "Hospital name is required"),
  city: z.string().min(2, "City is required"),
  contactNumber: z.string().min(5, "Contact number is required"),
});

// Password confirmation rule
function refinePassword(schema) {
  return schema.refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
}

const donorFormSchema = refinePassword(donorSchema);
const hospitalFormSchema = refinePassword(hospitalSchema);

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("donor");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(role === "donor" ? donorFormSchema : hospitalFormSchema),
  });

  // Convert mobile input to digits only
  const handleMobileInput = (e) => {
    const clean = e.target.value.replace(/\D/g, "");
    setValue("contactNumber", clean);
  };

  // -----------------------------
  // 🔥 SUBMIT REGISTRATION
  // -----------------------------
  const onSubmit = async (values) => {
    try {
      const payload = { ...values, role };

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

      toast.success("Account created successfully!");

      // After email signup → go to login
      router.push("/login");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 pt-10 pb-12">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 md:p-8">

          {/* HEADER */}
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Create your account
          </h2>

          <p className="text-center text-slate-400 text-sm mb-6">
            Join LifeLink as{" "}
            <span className="text-red-400 font-semibold">{role}</span>.
          </p>

          {/* ROLE SELECTOR */}
          <div className="flex gap-3 text-xs mb-6">
            <button
              type="button"
              onClick={() => setRole("donor")}
              className={`flex-1 p-2 rounded-lg border ${
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
              className={`flex-1 p-2 rounded-lg border ${
                role === "hospital"
                  ? "border-red-500 bg-red-500/20 text-red-200"
                  : "border-slate-700 text-slate-300"
              }`}
            >
              Hospital
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* COMMON FIELDS */}
            <div>
              <Input label="Full Name" {...register("name")} />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Input label="Email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Input label="Password" type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
              <div>
                <Input label="Confirm" type="password" {...register("confirm")} />
                {errors.confirm && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirm.message}</p>
                )}
              </div>
            </div>

            {/* DONOR FIELDS */}
            {role === "donor" && (
              <>
                <div>
                  <Input label="City" {...register("city")} />
                  {errors.city && (
                    <p className="text-red-400 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Mobile Number"
                    maxLength={10}
                    {...register("contactNumber")}
                    onChange={handleMobileInput}
                  />
                  {errors.contactNumber && (
                    <p className="text-red-400 text-sm mt-1">{errors.contactNumber.message}</p>
                  )}
                </div>

                <div className="text-sm flex flex-col">
                  <label className="text-slate-300 mb-1">Blood Group</label>
                  <select
                    {...register("bloodGroup")}
                    className="border border-slate-700 bg-slate-800 p-2 rounded text-white"
                  >
                    <option value="">Select Blood Group</option>
                    {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                  {errors.bloodGroup && (
                    <p className="text-red-400 text-sm mt-1">{errors.bloodGroup.message}</p>
                  )}
                </div>
              </>
            )}

            {/* HOSPITAL FIELDS */}
            {role === "hospital" && (
              <>
                <div>
                  <Input label="Hospital Name" {...register("hospitalName")} />
                  {errors.hospitalName && (
                    <p className="text-red-400 text-sm mt-1">{errors.hospitalName.message}</p>
                  )}
                </div>

                <div>
                  <Input label="City" {...register("city")} />
                  {errors.city && (
                    <p className="text-red-400 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <Input label="Contact Number" {...register("contactNumber")} />
                  {errors.contactNumber && (
                    <p className="text-red-400 text-sm mt-1">{errors.contactNumber.message}</p>
                  )}
                </div>
              </>
            )}

            <Button className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register"}
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
