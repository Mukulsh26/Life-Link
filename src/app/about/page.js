"use client";

import Navbar from "../components/Navbar";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          About <span className="text-red-500">LifeLink</span>
        </h1>

        <p className="text-slate-400 text-center mb-12 max-w-3xl mx-auto">
          LifeLink is a digital platform created to connect blood donors with
          hospitals and patients in need—quickly, reliably, and securely.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-3 text-red-400">Our Mission</h2>
            <p className="text-slate-400">
              To ensure no life is lost due to unavailability of blood by
              creating a fast and reliable donor–hospital network.
            </p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-3 text-red-400">Why LifeLink?</h2>
            <p className="text-slate-400">
              We simplify blood requests, donor communication, and emergency
              response through an intuitive system.
            </p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-3 text-red-400">Our Vision</h2>
            <p className="text-slate-400">
              A world where finding a blood donor is instant, transparent, and
              stress-free for everyone.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
