"use client";

import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Quote,
  HeartHandshake,
  Users,
  Sparkles,
  Heart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// BLOOD DROP ANIMATION
const Drop = ({ delay, left }) => (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 0.8, y: 800 }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay,
      ease: "easeIn",
    }}
    className="absolute w-2 h-5 bg-red-600 rounded-full blur-[2px]"
    style={{ left }}
  />
);

export default function TestimonialsPage() {
  const router = useRouter();

  const testimonials = [
    {
      name: "Amit Verma",
      role: "Blood Donor",
      message:
        "LifeLink helped me find nearby recipients instantly. The process was smooth and meaningful.",
    },
    {
      name: "City Hospital",
      role: "Hospital Admin",
      message:
        "Managing emergency blood requests became so easy. Real-time donor responses are a lifesaver.",
    },
    {
      name: "Ritu Sharma",
      role: "Recipient Family",
      message:
        "We needed O+ urgently. LifeLink connected us to donors within minutes. Truly grateful.",
    },
    {
      name: "Kunal Mehra",
      role: "Volunteer Donor",
      message:
        "The platform notifies me whenever someone needs my blood type nearby. A great initiative!",
    },
    {
      name: "Metro Care Clinic",
      role: "Hospital",
      message:
        "LifeLink completely transformed our emergency blood management system.",
    },
    {
      name: "Anjali Rao",
      role: "Recipient",
      message:
        "My mother needed AB- urgently. LifeLink helped us reach donors faster than ever.",
    },
    {
      name: "Rajesh Tiwari",
      role: "Frequent Donor",
      message:
        "I love how simple it is to donate. The app is clean, quick, and reliable.",
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <Navbar />

      {/* BLOOD DROPS */}
      {[...Array(15)].map((_, i) => (
        <Drop key={i} delay={i * 0.4} left={`${Math.random() * 100}%`} />
      ))}

      {/* HERO */}
      <section className="relative py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold mb-4"
        >
          Stories From Our <span className="text-red-500">LifeLink Heroes</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg max-w-2xl mx-auto"
        >
          Real experiences from donors, hospitals, and families who found help
          when they needed it the most.
        </motion.p>

        <Sparkles
          className="absolute top-20 right-20 text-red-500/40 animate-pulse hidden md:block"
          size={70}
        />
        <HeartHandshake
          className="absolute top-28 left-16 text-red-700/30 hidden md:block"
          size={80}
        />
      </section>

      {/* TESTIMONIAL SLIDER */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="relative h-64 md:h-52">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-xl shadow-red-900/20 relative"
            >
              <Quote
                size={50}
                className="absolute -top-5 -left-5 text-red-700/60"
              />

              <p className="italic text-slate-200 text-lg mb-6 leading-relaxed">
                “{testimonials[index].message}”
              </p>

              <h3 className="font-semibold text-xl">{testimonials[index].name}</h3>
              <p className="text-sm text-red-400">{testimonials[index].role}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* INDICATORS */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full transition-all ${
                i === index
                  ? "bg-red-500 scale-110 shadow-red-500/50 shadow-md"
                  : "bg-slate-700"
              }`}
            ></div>
          ))}
        </div>
      </section>

      {/* 🔥 CTA SECTION: JOIN LIFELINK */}
      {/* 🔥 CTA SECTION: DYNAMIC JOIN / DASHBOARD */}
<section className="relative max-w-5xl mx-auto px-6 pb-24 mt-10 text-center">
  {/* Title */}
  <motion.h2
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="text-3xl md:text-4xl font-bold mb-4"
  >
    {typeof window !== "undefined" && localStorage.getItem("lifelink_user")
      ? (() => {
          const user = JSON.parse(localStorage.getItem("lifelink_user"));
          return user.role === "donor"
            ? "Thank You for Being a LifeLink Hero ❤️"
            : "Your Hospital Helps Save Lives Every Day";
        })()
      : (
        <>
          Become a Part of the <span className="text-red-500">LifeLink</span> Family
        </>
      )}
  </motion.h2>

  {/* Description */}
  <motion.p
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
    className="text-slate-400 max-w-2xl mx-auto mb-8"
  >
    {typeof window !== "undefined" && localStorage.getItem("lifelink_user")
      ? (() => {
          const user = JSON.parse(localStorage.getItem("lifelink_user"));
          return user.role === "donor"
            ? "Check new matching requests and continue saving lives."
            : "Manage requests, view responders, and help patients faster.";
        })()
      : "Join thousands of donors and hospitals saving lives every single day."}
  </motion.p>

  {/* Floating heart */}
  <motion.div
    animate={{ y: [-10, 10, -10] }}
    transition={{ duration: 3, repeat: Infinity }}
    className="flex justify-center mb-6"
  >
    <Heart className="text-red-500" size={45} />
  </motion.div>

  {/* Dynamic Button */}
  <motion.button
    whileHover={{ scale: 1.08, boxShadow: "0 0 20px rgba(255,0,0,0.5)" }}
    whileTap={{ scale: 0.96 }}
    onClick={() => {
      const raw = typeof window !== "undefined" && localStorage.getItem("lifelink_user");
      if (!raw) return router.push("/signup");

      const user = JSON.parse(raw);

      if (user.role === "donor")
        return router.push("/dashboard?tab=requests");

      if (user.role === "hospital")
        return router.push("/dashboard?tab=my");
    }}
    className="px-8 py-3 bg-red-600 rounded-xl text-white font-semibold
               shadow-lg shadow-red-900/40 hover:bg-red-700 transition"
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
</section>

    </main>
  );
}
