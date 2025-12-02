"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RespondersPage() {
  const { id } = useParams();
  const router = useRouter();

  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResponders();
  }, []);

  const loadResponders = async () => {
    const token = localStorage.getItem("lifelink_token");

    try {
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

      // The API returns: { responders: [ { donor: {...}, respondedAt } ] }
      const formatted = data.responders.map((r) => r.donor);

      setResponders(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
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
            className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow"
          >
            <h2 className="text-xl font-semibold text-red-300">
              {donor.name}
            </h2>

            <p className="text-slate-300 text-sm">Email: {donor.email}</p>
            <p className="text-slate-300 text-sm">City: {donor.city}</p>
            <p className="text-slate-300 text-sm">Mobile: {donor.contactNumber}</p>
            <p className="text-red-400 font-bold">
              Blood Group: {donor.bloodGroup}
            </p>
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
