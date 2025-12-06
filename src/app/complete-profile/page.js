"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { State, City } from "country-state-city";

// ------------------------------
// ZOD SCHEMAS
// ------------------------------
const donorSchema = z.object({
  role: z.literal("donor"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().length(6, "Pincode must be 6 digits"),
  address: z.string().min(5, "Address is required"),
  contactNumber: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  bloodGroup: z.string().min(1, "Select blood group"),
  lastDonationDate: z.string().optional(),
});


const hospitalSchema = z.object({
  role: z.literal("hospital"),
  hospitalName: z.string().min(2, "Hospital name is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().length(6, "Pincode must be 6 digits"),
  address: z.string().min(5, "Address is required"),
  contactNumber: z.string().min(5, "Contact number is required"),
});


const schemas = { donor: donorSchema, hospital: hospitalSchema };

export default function CompleteProfile() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [states, setStates] = useState([]);
const [cities, setCities] = useState([]);
const [selectedState, setSelectedState] = useState("");


  // ------------------------------
  // Load User + Protect Route
  // ------------------------------
  useEffect(() => {
    const token = localStorage.getItem("lifelink_token");
    const u = JSON.parse(localStorage.getItem("lifelink_user") || "{}");

    if (!token || !u?.id) {
      router.replace("/login");
      return;
    }

    if (u.profileCompleted) {
      router.replace("/dashboard");
      return;
    }

    setUser(u);
  }, []);

  useEffect(() => {
  const indianStates = State.getStatesOfCountry("IN");
  setStates(indianStates);
}, []);


useEffect(() => {
  if (!selectedState) return;
  const citiesList = City.getCitiesOfState("IN", selectedState);
  setCities(citiesList);
}, [selectedState]);




  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(schemas[role] || donorSchema),
  });

  const handleMobileInput = (e) => {
    const clean = e.target.value.replace(/\D/g, "");
    setValue("contactNumber", clean);
  };

  // ------------------------------
  // SUBMIT FORM
  // ------------------------------
  const onSubmit = async (values) => {
    try {
      const res = await fetch("/api/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lifelink_token")}`,
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      localStorage.setItem("lifelink_token", data.token);
localStorage.setItem("lifelink_user", JSON.stringify(data.user));


      toast.success("Profile completed!");
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  if (!user) return null;

  // ------------------------------
  // SVG ICONS (No files needed)
  // ------------------------------
  const BloodIcon = () => (
    <svg
      className="w-8 h-8 text-red-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 2c4 5 7 8 7 12a7 7 0 1 1-14 0c0-4 3-7 7-12z" />
    </svg>
  );

  const HospitalIcon = () => (
    <svg
      className="w-8 h-8 text-blue-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 21V8l9-5 9 5v13H3z" />
      <path d="M9 14h6" />
      <path d="M12 11v6" />
    </svg>
  );

  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="flex justify-center items-start pt-16 pb-10 min-h-screen px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-xl">

          <h2 className="text-3xl font-bold text-center mb-4">
            Complete Your Profile
          </h2>

          <p className="text-center text-slate-400 text-sm mb-8">
            Choose your role to continue.
          </p>

          {/* ------------------------------ */}
          {/* 🔥 IMPROVED ROLE SELECTOR */}
          {/* ------------------------------ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

            {/* Donor Card */}
            <div
              onClick={() => {
                setRole("donor");
                reset({ role: "donor" });
              }}
              className={`cursor-pointer rounded-xl border p-5 flex flex-col items-center gap-3 transition-all
                ${
                  role === "donor"
                    ? "border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(255,0,0,0.3)]"
                    : "border-slate-700 bg-slate-800/40 hover:border-red-400 hover:bg-slate-800"
                }
              `}
            >
              <div className="w-14 h-14 rounded-full bg-red-600/20 flex items-center justify-center">
                <BloodIcon />
              </div>
              <p className="text-lg font-semibold">Donor</p>
              <p className="text-xs text-slate-400 text-center">
                Donate blood & save lives.
              </p>
            </div>

            {/* Hospital Card */}
            <div
              onClick={() => {
                setRole("hospital");
                reset({ role: "hospital" });
              }}
              className={`cursor-pointer rounded-xl border p-5 flex flex-col items-center gap-3 transition-all
                ${
                  role === "hospital"
                    ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(0,120,255,0.3)]"
                    : "border-slate-700 bg-slate-800/40 hover:border-blue-400 hover:bg-slate-800"
                }
              `}
            >
              <div className="w-14 h-14 rounded-full bg-blue-600/20 flex items-center justify-center">
                <HospitalIcon />
              </div>
              <p className="text-lg font-semibold">Hospital</p>
              <p className="text-xs text-slate-400 text-center">
                Manage blood requests.
              </p>
            </div>
          </div>

          {/* ------------------------------ */}
          {/* FORM FIELDS */}
          {/* ------------------------------ */}
          {role && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              <input type="hidden" {...register("role")} value={role} />

              {/* DONOR FORM */}
              {role === "donor" && (
                <>
                 {/* STATE */}
<div>
  <label className="block text-sm mb-1">State</label>
  <select
  {...register("state")}
  value={selectedState}
  onChange={(e) => {
    setSelectedState(e.target.value);
    setValue("state", e.target.value);
    setValue("city", "");
  }}
  className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
>
  <option value="">Select State</option>
  {states.map((s) => (
    <option key={s.isoCode} value={s.isoCode}>
      {s.name}
    </option>
  ))}
</select>

  {errors.state && <p className="text-red-400 text-sm">{errors.state.message}</p>}
</div>

{/* CITY */}
<div>
  <label className="block text-sm mb-1">City</label>
  <select
  {...register("city")}
  className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
>
  <option value="">Select City</option>
  {cities.map((c) => (
    <option key={c.name} value={c.name}>
      {c.name}
    </option>
  ))}
</select>

  {errors.city && <p className="text-red-400 text-sm">{errors.city.message}</p>}
</div>

{/* PINCODE */}
<div>
  <label className="block text-sm mb-1">Pincode</label>
  <input
    maxLength={6}
    {...register("pincode")}
    onChange={(e) => setValue("pincode", e.target.value.replace(/\D/g, ""))}
    className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
  />
  {errors.pincode && <p className="text-red-400 text-sm">{errors.pincode.message}</p>}
</div>

{/* ADDRESS */}
<div>
  <label className="block text-sm mb-1">Address</label>
  <textarea
    {...register("address")}
    className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
  />
  {errors.address && <p className="text-red-400 text-sm">{errors.address.message}</p>}
</div>

                  <div>
                    <label className="block text-sm mb-1">Mobile Number</label>
                    <input
                      maxLength={10}
                      {...register("contactNumber")}
                      onChange={handleMobileInput}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
                    />
                    {errors.contactNumber && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.contactNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Blood Group</label>
                    <select
                      {...register("bloodGroup")}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
                    >
                      <option value="">Select Blood Group</option>
                      {[
                        "A+",
                        "A-",
                        "B+",
                        "B-",
                        "O+",
                        "O-",
                        "AB+",
                        "AB-",
                      ].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                    {errors.bloodGroup && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.bloodGroup.message}
                      </p>
                    )}
                  </div>

                  {/* LAST DONATION DATE */}
<div>
  <label className="block text-sm mb-1">Last Donation Date (optional)</label>
  <input
    type="date"
    {...register("lastDonationDate")}
    className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
  />
</div>

                </>
              )}

              {/* HOSPITAL FORM */}
              {role === "hospital" && (
                <>
  {/* HOSPITAL NAME */}
  <div>
    <label className="block text-sm mb-1">Hospital Name</label>
    <input
      {...register("hospitalName")}
      className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
    />
    {errors.hospitalName && (
      <p className="text-red-400 text-sm mt-1">
        {errors.hospitalName.message}
      </p>
    )}
  </div>

  {/* STATE */}
  <div>
    <label className="block text-sm mb-1">State</label>
    <select
  {...register("state")}
  value={selectedState}
  onChange={(e) => {
    setSelectedState(e.target.value);
    setValue("state", e.target.value);
    setValue("city", "");
  }}
  className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
>
  <option value="">Select State</option>
  {states.map((s) => (
    <option key={s.isoCode} value={s.isoCode}>
      {s.name}
    </option>
  ))}
</select>
    {errors.state && <p className="text-red-400 text-sm">{errors.state.message}</p>}
  </div>

  {/* CITY */}
  <div>
    <label className="block text-sm mb-1">City</label>
    <select
  {...register("city")}
  className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
>
  <option value="">Select City</option>
  {cities.map((c) => (
    <option key={c.name} value={c.name}>
      {c.name}
    </option>
  ))}
</select>
    {errors.city && <p className="text-red-400 text-sm">{errors.city.message}</p>}
  </div>

  {/* PINCODE */}
  <div>
    <label className="block text-sm mb-1">Pincode</label>
    <input
      maxLength={6}
      {...register("pincode")}
      onChange={(e) => setValue("pincode", e.target.value.replace(/\D/g, ""))}
      className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
    />
    {errors.pincode && <p className="text-red-400 text-sm">{errors.pincode.message}</p>}
  </div>

  {/* ADDRESS */}
  <div>
    <label className="block text-sm mb-1">Full Address</label>
    <textarea
      {...register("address")}
      className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
    />
    {errors.address && <p className="text-red-400 text-sm">{errors.address.message}</p>}
  </div>

  {/* CONTACT NUMBER */}
  <div>
    <label className="block text-sm mb-1">Hospital Contact Number</label>
    <input
      {...register("contactNumber")}
      className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
    />
    {errors.contactNumber && (
      <p className="text-red-400 text-sm">{errors.contactNumber.message}</p>
    )}
  </div>
</>
              )}

              <button className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition">
                Save Profile
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
