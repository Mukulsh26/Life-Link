"use client";

import Navbar from "../components/Navbar";

export default function TestimonialsPage() {
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
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          What People Say About <span className="text-red-500">LifeLink</span>
        </h1>

        <p className="text-slate-400 text-center mb-12 max-w-3xl mx-auto">
          Real experiences from donors, hospitals, and people helped through our platform.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow"
            >
              <p className="italic text-slate-300 mb-4">“{t.message}”</p>
              <h3 className="font-semibold text-lg">{t.name}</h3>
              <p className="text-sm text-red-400">{t.role}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
