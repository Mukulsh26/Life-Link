"use client";

import Navbar from "../components/Navbar";
import { Droplet, HeartPulse, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      {/* Animated floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-red-600 rounded-full opacity-40"
            initial={{
              x: Math.random() * 1400 - 200,
              y: Math.random() * 800 - 200,
              scale: Math.random() * 1.5 + 0.5,
            }}
            animate={{
              y: "-200%",
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: Math.random() * 6 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <Navbar />

      <section className="relative max-w-6xl mx-auto px-6 py-20">

        {/* HERO SECTION */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            About <span className="text-red-500 drop-shadow-lg">LifeLink</span>
          </h1>

          <p className="mt-6 text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed">
            LifeLink connects voluntary blood donors with hospitals and patients —
            <span className="text-red-400 font-semibold">
              instantly, transparently, and reliably
            </span>
            . Our mission is to make sure no life is ever lost due to unavailability of blood.
          </p>
        </motion.div>

        {/* FEATURE CARDS */}
        <div className="grid md:grid-cols-3 gap-8 mt-10">
          {/* Mission */}
          <motion.div
            className="group relative p-6 rounded-2xl border border-red-900/30 bg-white/5 backdrop-blur-xl 
                      hover:bg-white/10 transition-all duration-300 shadow-xl hover:shadow-red-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Droplet className="text-red-400 w-8 h-8 group-hover:scale-110 transition" />
              <h2 className="text-xl font-semibold">Our Mission</h2>
            </div>
            <p className="text-slate-300">
              Eliminating delays during emergencies by building the fastest blood donor
              communication network.
            </p>
          </motion.div>

          {/* Why LifeLink */}
          <motion.div
            className="group relative p-6 rounded-2xl border border-red-900/30 bg-white/5 backdrop-blur-xl
                      hover:bg-white/10 transition-all duration-300 shadow-xl hover:shadow-red-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <HeartPulse className="text-red-400 w-8 h-8 group-hover:scale-110 transition" />
              <h2 className="text-xl font-semibold">Why LifeLink?</h2>
            </div>
            <p className="text-slate-300">
              A secure and smart system designed to simplify emergency requests, donor 
              verification, and real-time response.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div
            className="group relative p-6 rounded-2xl border border-red-900/30 bg-white/5 backdrop-blur-xl
                      hover:bg-white/10 transition-all duration-300 shadow-xl hover:shadow-red-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-red-400 w-8 h-8 group-hover:scale-110 transition" />
              <h2 className="text-xl font-semibold">Our Vision</h2>
            </div>
            <p className="text-slate-300">
              A world where finding a life-saving blood donor takes less than a minute — 
              without stress, waiting, or uncertainty.
            </p>
          </motion.div>
        </div>

        {/* Bottom Section CTA */}
        {/* Bottom Section CTA - Dynamic Like Homepage */}
<motion.div
  className="relative text-center mt-20 py-12 px-4"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 1, delay: 0.4 }}
>
  {/* Glowing halo */}
  <div className="absolute inset-0 -z-10 bg-red-600/10 blur-3xl rounded-full" />

  {/* Heading based on login status */}
  <h2 className="text-3xl font-extrabold mb-3">
    {typeof window !== "undefined" && localStorage.getItem("lifelink_user")
      ? (() => {
          const user = JSON.parse(localStorage.getItem("lifelink_user"));
          return user.role === "donor"
            ? "You're a Life Saver ❤️"
            : "Your Hospital Saves Lives Every Day";
        })()
      : "Become Part of LifeLink"}
  </h2>

  {/* Sub-text */}
  <p className="text-slate-400 max-w-2xl mx-auto mb-8">
    {typeof window !== "undefined" && localStorage.getItem("lifelink_user")
      ? (() => {
          const user = JSON.parse(localStorage.getItem("lifelink_user"));
          return user.role === "donor"
            ? "Continue helping patients by checking new matching requests."
            : "Manage and track life-saving blood requests efficiently.";
        })()
      : "Join India’s fastest emergency blood network — every drop counts."}
  </p>

  {/* Dynamic Button */}
  <motion.button
    whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(255,0,0,0.5)" }}
    whileTap={{ scale: 0.9 }}
    onClick={() => {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem("lifelink_user");

      if (!raw) return (window.location.href = "/signup");

      const user = JSON.parse(raw);
      if (user.role === "donor")
        return (window.location.href = "/dashboard?tab=requests");

      if (user.role === "hospital")
        return (window.location.href = "/dashboard?tab=my");
    }}
    className="px-10 py-3 rounded-full bg-gradient-to-r from-red-600 to-red-500 
    hover:from-red-500 hover:to-red-600 text-white font-semibold 
    shadow-lg shadow-red-900/30 hover:shadow-red-700/40 
    transition-all duration-300"
  >
    {typeof window !== "undefined" && localStorage.getItem("lifelink_user")
      ? (() => {
          const user = JSON.parse(localStorage.getItem("lifelink_user"));
          return user.role === "donor"
            ? "Go to Dashboard"
            : "Manage Requests";
        })()
      : "Join LifeLink Today"}
  </motion.button>
</motion.div>

      </section>
    </main>
  );
}
