// src/app/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import { Heart, BellRing, Hospital, Users } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Load logged-in user if exists
  useEffect(() => {
    const storedUser = localStorage.getItem("lifelink_user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const goToDashboard = () => {
    if (!user) return;
    if (user.role === "donor") router.push("/dashboard?tab=requests");
    else router.push("/dashboard?tab=my");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      {/* HERO SECTION */}
      <section className="px-6 pt-24 pb-20 text-center bg-gradient-to-b from-slate-900 to-slate-950">
        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
          Connect. Donate. <span className="text-red-500">Save Lives.</span>
        </h1>

        <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto">
          A real-time blood donation network helping hospitals reach donors instantly.
          Every second counts — your contribution matters.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          {/* Hide Join/Login if user already logged in */}
          {!user && (
            <>
              <button
                onClick={() => router.push("/register")}
                className="px-8 py-3 text-lg font-semibold bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-900/20 transition-all active:scale-95"
              >
                Join as Donor / Hospital
              </button>

              <button
                onClick={() => router.push("/login")}
                className="px-8 py-3 text-lg font-semibold border border-slate-700 rounded-xl hover:bg-slate-800 transition-all active:scale-95"
              >
                Login
              </button>
            </>
          )}

          {/* If logged in → go to dashboard */}
          {user && (
            <button
              onClick={goToDashboard}
              className="px-8 py-3 text-lg font-semibold bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-900/20 transition-all active:scale-95"
            >
              Go to Dashboard
            </button>
          )}
        </div>

        {/* Decorative Heart Icon */}
        <div className="mt-12 flex justify-center">
          <Heart className="w-12 h-12 text-red-500 animate-pulse drop-shadow-lg" />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-6xl mx-auto px-6 mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Card 1 */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:shadow-xl hover:shadow-red-900/10 transition cursor-pointer">
          <BellRing className="w-10 h-10 text-red-400 mb-4" />
          <h3 className="font-bold text-xl text-red-400">Real-Time Alerts</h3>
          <p className="text-slate-400 text-sm mt-2">
            Donors receive instant notifications when their blood group is needed.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:shadow-xl hover:shadow-red-900/10 transition cursor-pointer">
          <Hospital className="w-10 h-10 text-red-400 mb-4" />
          <h3 className="font-bold text-xl text-red-400">Hospital Dashboard</h3>
          <p className="text-slate-400 text-sm mt-2">
            Hospitals can create, manage, and track requests instantly.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:shadow-xl hover:shadow-red-900/10 transition cursor-pointer">
          <Users className="w-10 h-10 text-red-400 mb-4" />
          <h3 className="font-bold text-xl text-red-400">Verified Donors</h3>
          <p className="text-slate-400 text-sm mt-2">
            Donors maintain their profile, track responses, and stay connected.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-slate-600 mt-24 py-6 border-t border-slate-800">
        © {new Date().getFullYear()} LifeLink — Saving lives together ❤️
      </footer>
    </main>
  );
}
