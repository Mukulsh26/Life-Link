// src/app/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import { motion } from "framer-motion";
import {
  Heart,
  BellRing,
  Hospital,
  Users,
  Sparkles,
  Droplet,
  ShieldCheck,
  Activity,
} from "lucide-react";

// Blood drop falling animation
const Drop = ({ delay, left }) => (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 0.8, y: 900 }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay,
      ease: "easeIn",
    }}
    className="absolute w-2 h-5 bg-red-600 rounded-full blur-[1px] opacity-70 pointer-events-none"
    style={{ left }}
  />
);


export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("lifelink_user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const goToDashboard = () => {
    if (!user) return;
    if (user.role === "donor") router.push("/dashboard?tab=requests");
    else router.push("/dashboard?tab=my");
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
  
  {/* BACKGROUND IMAGE */}
 {/* BACKGROUND IMAGE */}
<div
  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
  style={{
    backgroundImage: "url('/images/life-link.png')",
  }}
/>


  <Navbar />

      {/* BLOOD DROPS */}
      {[...Array(20)].map((_, i) => (
        <Drop key={i} delay={i * 0.3} left={`${Math.random() * 100}%`} />
      ))}

      {/* HERO SECTION */}
      <section className="relative px-6 pt-28 pb-14 text-center">

        {/* Glowing Background Aura */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] 
bg-red-700/20 blur-[200px] rounded-full pointer-events-none" />


        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl sm:text-6xl font-extrabold leading-tight drop-shadow-lg"
        >
          Connect. Donate.  
          <span className="text-red-500"> Save Lives.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-300 mt-5 text-lg max-w-2xl mx-auto"
        >
          A real-time life-saving ecosystem connecting donors, hospitals, and
          patients with blazing speed. Every second matters.
        </motion.p>

        {/* Floating sparkles */}
        <Sparkles
  className="absolute top-16 right-12 text-red-400/40 animate-pulse hidden md:block pointer-events-none"
  size={60}
/>

<Sparkles
  className="absolute bottom-20 left-12 text-red-500/30 animate-pulse hidden md:block pointer-events-none"
  size={50}
/>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          {!user && (
            <>
              <button
                onClick={() => router.push("/signup")}
                className="px-10 py-3 text-lg font-semibold bg-red-600 hover:bg-red-700 rounded-xl
                shadow-lg shadow-red-900/40 hover:scale-105 active:scale-95 transition-all"
              >
                Join as Donor / Hospital
              </button>

              <button
                onClick={() => router.push("/login")}
                className="px-10 py-3 text-lg font-semibold border border-red-700 text-red-400
                rounded-xl hover:bg-red-600/10 hover:scale-105 active:scale-95 transition-all"
              >
                Login
              </button>
            </>
          )}

          {user && (
            <button
              onClick={goToDashboard}
              className="px-10 py-3 text-lg font-semibold bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-900/40"
            >
              Go to Dashboard
            </button>
          )}
        </motion.div>

        {/* Pulsing heart */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-14 flex justify-center"
        >
          <Heart className="w-14 h-14 text-red-500 drop-shadow-xl" />
        </motion.div>
      </section>

      {/* FEATURE CARDS */}
      <section className="relative max-w-6xl mx-auto px-6 mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
        {[
          {
            Icon: BellRing,
            title: "Real-time Alerts",
            text: "Donors get instant notifications when someone nearby needs their blood group.",
          },
          {
            Icon: Hospital,
            title: "Hospital Dashboard",
            text: "Hospitals manage emergency requests effortlessly with a powerful control panel.",
          },
          {
            Icon: Users,
            title: "Verified Donors",
            text: "Only verified donors respond—ensuring trustworthy, life-saving interactions.",
          },
          {
            Icon: Activity,
            title: "Smart Matching",
            text: "AI-assisted matching ensures requests reach the right donors faster.",
          },
          {
            Icon: ShieldCheck,
            title: "Secure & Private",
            text: "Your data is encrypted and safely stored. Privacy is our highest priority.",
          },
          {
            Icon: Droplet,
            title: "Faster Response",
            text: "Our optimized system ensures donors reach hospitals in record time.",
          },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-slate-900/70 border border-slate-700 p-6 rounded-2xl 
            hover:shadow-red-800/30 hover:shadow-xl hover:scale-[1.04]
            backdrop-blur-xl transition-all cursor-pointer"
          >
            <card.Icon className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="font-bold text-xl text-red-300">{card.title}</h3>
            <p className="text-slate-400 text-sm mt-2">{card.text}</p>
          </motion.div>
        ))}
      </section>

      {/* BLOOD WAVE ANIMATION */}
      <div className="w-full h-32 bg-gradient-to-t from-red-900/30 to-transparent blur-[2px]" />

      {/* CALL TO ACTION */}
      {/* CALL TO ACTION */}
{/* CALL TO ACTION */}
<section className="relative text-center py-20 px-6 z-10">

  {/* Background Glow Effect */}
  <div className="absolute inset-0 -z-10 bg-red-700/10 blur-3xl rounded-full" />

  {/* Personalized Heading */}
  <motion.h2
    initial={{ opacity: 0, y: 25 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="text-3xl md:text-4xl font-extrabold mb-4"
  >
    {user
      ? user.role === "donor"
        ? "Thank You for Being a Life Saver ❤️"
        : "Your Hospital Helps Save Lives Every Day"
      : "Ready to Save Lives?"}
  </motion.h2>

  {/* Description */}
  <motion.p
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    className="text-slate-300 mt-2 max-w-2xl mx-auto text-lg"
  >
    {user
      ? user.role === "donor"
        ? "Your contribution makes a real impact. Take a moment to check new matching requests and help someone today."
        : "Manage all blood requests in real-time and coordinate with life-saving donors efficiently."
      : "Become part of India’s fastest-growing blood donation network. Your single donation can save up to 3 lives."}
  </motion.p>

  {/* Donor / Hospital Stats */}
  {user && (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="mt-6 inline-block bg-slate-900 border border-slate-700 mr-4 px-6 py-3 rounded-xl shadow-lg"
    >
      <p className="text-sm text-slate-400">
        {user.role === "donor"
          ? `💧 You have responded to ${user.respondCount || 0} requests so far.`
          : `🏥 Your hospital has created ${user.requestCount || 0} requests.`}
      </p>
    </motion.div>
  )}

  {/* CTA BUTTON */}
  <motion.button
    whileHover={{
      scale: 1.08,
      boxShadow: "0 0 30px rgba(255,0,0,0.5)",
    }}
    whileTap={{ scale: 0.94 }}
    onClick={() =>
      user
        ? user.role === "donor"
          ? router.push("/dashboard?tab=requests")
          : router.push("/dashboard?tab=my")
        : router.push("/signup")
    }
    className="mt-8 px-10 py-3 bg-red-600 rounded-xl text-white font-semibold
    shadow-lg shadow-red-900/40 hover:bg-red-700 transition text-lg"
  >
    {user
      ? user.role === "donor"
        ? "Go to Dashboard"
        : "Manage Requests"
      : "Join Now"}
  </motion.button>

  {/* Subtle pulsing ring under the button */}
  <div className="relative">
    <motion.div
      animate={{ opacity: [0.4, 0.1, 0.4], scale: [1, 1.15, 1] }}
      transition={{ repeat: Infinity, duration: 3 }}
      className="absolute inset-x-0 mx-auto -top-4 w-60 h-16 bg-red-700/10 rounded-full blur-2xl"
    />
  </div>
</section>



      {/* FOOTER */}
      <footer className="text-center text-slate-600 mt-10 py-6 border-t border-slate-800">
        © {new Date().getFullYear()} LifeLink — Saving Lives Together ❤️
      </footer>
    </main>
  );
}
