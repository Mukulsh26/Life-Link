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
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <p className="text-slate-400 text-lg mb-6">
            Every drop counts. Every second matters.
          </p>

          <button
            onClick={() => (window.location.href = "/signup")}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-red-600 to-red-500
                     hover:from-red-500 hover:to-red-600 text-white font-semibold 
                     shadow-lg shadow-red-900/30 hover:shadow-red-700/40
                     transition-all duration-300"
          >
            Join as a Donor
          </button>
        </motion.div>
      </section>
    </main>
  );
}
