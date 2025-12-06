"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { pusherClient } from "../../../../lib/pusher-client";
import { Phone, Copy, MessageCircle } from "lucide-react";
import { useLoader } from "../../../context/LoaderContext"; // ✅ loader

export default function RespondersPage() {
  const { id } = useParams();
  const router = useRouter();
  const { setLoading } = useLoader(); // ✅ global loader

  const [responders, setResponders] = useState([]);
  const [loading, setLocalLoading] = useState(true);

  useEffect(() => {
    loadResponders();
  }, []);

  const loadResponders = async () => {
    const token = localStorage.getItem("lifelink_token");

    try {
      setLoading(true); // ✅ SHOW GLOBAL LOADER

      const res = await fetch("/api/requests/responders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to load responders");
        return;
      }

      const formatted = data.responders.map((r) => r.donor);
      setResponders(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLocalLoading(false);
      setLoading(false); // ✅ HIDE LOADER
    }
  };

  useEffect(() => {
    const channel = pusherClient.subscribe("blood-requests");

    channel.bind("donor-responded", (data) => {
      if (data.requestId === id) {
        setResponders((prev) => [...prev, data.donor]);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  const copyToClipboard = (number) => {
    navigator.clipboard.writeText(number);
    toast.success("Phone number copied!");
  };

  return (
    <main className="min-h-screen px-6 py-10">
      <h1 className="text-3xl font-bold text-red-400 mb-6">
        Donor Responders
      </h1>

      {loading && <p className="text-slate-400">Loading...</p>}

      {!loading && responders.length === 0 && (
        <p className="text-slate-500">No donors responded yet.</p>
      )}

      <div className="grid gap-4 mt-4">
        {responders.map((donor, index) => (
          <div
  key={index}
  className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow relative"
>
  <h2 className="text-xl font-semibold text-red-300">{donor.name}</h2>

  <p className="text-slate-300 text-sm">Email: {donor.email}</p>
  <p className="text-slate-300 text-sm">City: {donor.city}</p>
  <p className="text-slate-300 text-sm">Mobile: {donor.contactNumber}</p>

  <p className="text-red-400 font-bold mt-1">
    Blood Group: {donor.bloodGroup}
  </p>

  {/* LAST DONATION DATE */}
  <p className="text-xs text-slate-400 mt-1">
    Last Donation:{" "}
    {donor.lastDonationDate
      ? new Date(donor.lastDonationDate).toLocaleDateString()
      : "Not available"}
  </p>

  {/* ACTION BUTTONS */}
  <div className="flex gap-3 mt-4">

    {/* CALL BUTTON */}
    <a
      href={`tel:${donor.contactNumber}`}
      className="flex-1 bg-green-600 hover:bg-green-700 text-center py-2 rounded-lg text-sm"
    >
      📞 Call
    </a>

    {/* WHATSAPP BUTTON */}
    <a
      href={`https://wa.me/91${donor.contactNumber}`}
      target="_blank"
      className="flex-1 bg-[#25D366] hover:bg-[#1ebe58] text-black text-center py-2 rounded-lg text-sm font-semibold"
    >
      💬 WhatsApp
    </a>

    {/* COPY BUTTON */}
    <button
      onClick={() => {
        navigator.clipboard.writeText(donor.contactNumber);
        toast.success("Number copied!");
      }}
      className="flex-1 bg-slate-700 hover:bg-slate-600 text-center py-2 rounded-lg text-sm"
    >
      📋 Copy
    </button>
  </div>
</div>

        ))}
      </div>

      <button
        onClick={() => router.back()}
        className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
      >
        Go Back
      </button>
    </main>
  );
}
