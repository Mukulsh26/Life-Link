"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Button from "../components/Button";
import RequestCard from "../components/RequestCard";

import { toast } from "sonner";
import { requestFcmToken } from "../../lib/firebase";
import { pusherClient } from "../../lib/pusher-client";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [tab, setTab] = useState("requests");
  const [hTab, setHTab] = useState("create");

  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  const [newReq, setNewReq] = useState({
    bloodGroup: "",
    quantity: 1,
    urgency: "medium",
    city: "",
    notes: "",
  });

  // ---------------------------------------------------------
  // 1️⃣ LOAD USER + INITIAL REQUESTS
  // ---------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("lifelink_token");
    const u = JSON.parse(localStorage.getItem("lifelink_user") || "{}");

    if (!token || !u || !u.role) {
      router.push("/login");
      return;
    }

    setUser(u);

    if (u.role === "donor") loadDonorRequests(u, token);
    if (u.role === "hospital") loadHospitalRequests(token);

  }, []);

  // ---------------------------------------------------------
  // 2️⃣ INITIAL FCM TOKEN REGISTRATION
  // ---------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    const setupFcm = async () => {
      try {
        const token = await requestFcmToken();
        if (!token) return;

        await fetch("/api/user/device-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("lifelink_token")}`,
          },
          body: JSON.stringify({ deviceToken: token }),
        });

        console.log("Device token saved");
      } catch (err) {
        console.error(err);
      }
    };

    setupFcm();
  }, [user]);

  // ---------------------------------------------------------
  // 3️⃣ REAL-TIME (DONOR)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!user || user.role !== "donor") return;

    const channel = pusherClient.subscribe("blood-requests");

    // New matching request
    channel.bind("new-request", (data) => {
      if (
        data.city === user.city.toLowerCase() &&
        data.bloodGroup === user.bloodGroup.toUpperCase()
      ) {
        loadDonorRequests(user, localStorage.getItem("lifelink_token"));
      }
    });

    // Deleted request
    channel.bind("delete-request", (data) => {
      setRequests((prev) => prev.filter((r) => r._id !== data.requestId));
    });

    // Status changed
    channel.bind("status-change", (data) => {
      setRequests((prev) =>
        prev.map((r) =>
          r._id === data.requestId ? { ...r, status: data.status } : r
        )
      );
    });

    return () => {
      pusherClient.unsubscribe("blood-requests");
    };
  }, [user]);

  // ---------------------------------------------------------
  // 4️⃣ REAL-TIME (HOSPITAL - DONOR RESPONDED)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!user || user.role !== "hospital") return;

    const channel = pusherClient.subscribe("blood-requests");

    // Donor responded
    channel.bind("donor-responded", (data) => {
      setMyRequests((prev) =>
        prev.map((r) =>
          r._id === data.requestId
            ? { ...r, responders: [...(r.responders || []), data.donor] }
            : r
        )
      );
    });

    // Deleted request
    channel.bind("delete-request", (data) => {
      setMyRequests((prev) => prev.filter((r) => r._id !== data.requestId));
    });

    // Status changed
    channel.bind("status-change", (data) => {
      setMyRequests((prev) =>
        prev.map((r) =>
          r._id === data.requestId ? { ...r, status: data.status } : r
        )
      );
    });

    return () => {
      pusherClient.unsubscribe("blood-requests");
    };
  }, [user]);

  // ---------------------------------------------------------
  // LOAD REQUESTS
  // ---------------------------------------------------------
  const loadDonorRequests = async (u, token) => {
    const res = await fetch(
      `/api/requests/list?role=donor&city=${encodeURIComponent(
        u.city
      )}&bloodGroup=${encodeURIComponent(u.bloodGroup)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();

    if (res.ok) {
      const formatted = data.requests.map((r) => ({
        ...r,
        responded: r.responders?.some(
          (p) => p.donor === u._id || p.donor?._id === u._id
        ),
      }));
      setRequests(formatted);
    }
  };

  const loadHospitalRequests = async (token) => {
    const res = await fetch(`/api/requests/list?role=hospital`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) setMyRequests(data.requests);
  };

  // ---------------------------------------------------------
  // CRUD ACTIONS
  // ---------------------------------------------------------
  const createRequest = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("lifelink_token");

    const payload = {
      ...newReq,
      city: newReq.city || user.city,
    };

    const res = await fetch("/api/requests/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error);
      return;
    }

    toast.success("Request created");
    loadHospitalRequests(token);

    setNewReq({
      bloodGroup: "",
      quantity: 1,
      urgency: "medium",
      city: "",
      notes: "",
    });
  };

  const respond = async (id) => {
    const token = localStorage.getItem("lifelink_token");

    const res = await fetch("/api/requests/respond", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId: id }),
    });

    const data = await res.json();

    if (!res.ok) return toast.error(data.error);

    toast.success("Response submitted");
    loadDonorRequests(user, token);
  };

  const deleteRequest = async (id) => {
    const token = localStorage.getItem("lifelink_token");

    const res = await fetch("/api/requests/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId: id }),
    });

    const data = await res.json();

    if (!res.ok) return toast.error(data.error);

    toast.success("Request deleted");
    loadHospitalRequests(token);
  };

  const changeStatus = async (id, status) => {
    const token = localStorage.getItem("lifelink_token");

    const res = await fetch("/api/requests/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId: id, status }),
    });

    const data = await res.json();

    if (!res.ok) return toast.error(data.error);

    toast.success("Status updated");
    loadHospitalRequests(token);
  };

  // ---------------------------------------------------------
  if (!user) return null;

  // ---------------------------------------------------------
  // DASHBOARD UI
  // ---------------------------------------------------------
  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-6">
        <h1 className="text-3xl font-bold mb-2">
          Welcome {user.role === "hospital" ? user.hospitalName : user.name}!
        </h1>

        <p className="text-slate-400 mb-6 capitalize">Role: {user.role}</p>

        {/* --------------------------------------------------- */}
        {/* DONOR DASHBOARD */}
        {/* --------------------------------------------------- */}
        {user.role === "donor" && (
          <>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => setTab("requests")}
                className={`px-3 py-2 rounded-lg border ${
                  tab === "requests"
                    ? "border-red-500 bg-red-500/20"
                    : "border-slate-700"
                }`}
              >
                Matching Requests
              </button>

              <button
                onClick={() => setTab("profile")}
                className={`px-3 py-2 rounded-lg border ${
                  tab === "profile"
                    ? "border-red-500 bg-red-500/20"
                    : "border-slate-700"
                }`}
              >
                Profile
              </button>
            </div>

            {tab === "requests" && (
              <div className="grid gap-4 mt-6">
                {requests.length === 0 && (
                  <p className="text-slate-400">No matching requests.</p>
                )}

                {requests.map((req) => (
                  <RequestCard
                    key={req._id}
                    request={req}
                    isDonor
                    onRespond={() => respond(req._id)}
                  />
                ))}
              </div>
            )}

            {tab === "profile" && (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg mt-6">

                <h2 className="text-xl font-bold text-red-400 mb-4">
                  Your Profile
                </h2>

                <div className="space-y-3 text-sm">
                  {[ 
                    ["Name", user.name],
                    ["Email", user.email],
                    ["City", user.city],
                    ["Blood Group", user.bloodGroup],
                    ["Contact Number", user.contactNumber],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between items-center border-b border-slate-800 pb-2"
                    >
                      <span className="text-slate-400">{label}</span>
                      <span
                        className={`font-semibold ${
                          label === "Blood Group" || label === "Contact Number"
                            ? "text-red-400"
                            : "text-slate-200"
                        }`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}

                  <div className="mt-4 bg-red-600/20 text-red-300 p-3 rounded-lg text-center text-xs font-medium">
                    Thank you for being a life-saving donor ❤️
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* --------------------------------------------------- */}
        {/* HOSPITAL DASHBOARD */}
        {/* --------------------------------------------------- */}
        {user.role === "hospital" && (
          <>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => setHTab("create")}
                className={`px-3 py-2 rounded-lg border ${
                  hTab === "create"
                    ? "border-red-500 bg-red-500/20"
                    : "border-slate-700"
                }`}
              >
                Create Request
              </button>

              <button
                onClick={() => setHTab("my")}
                className={`px-3 py-2 rounded-lg border ${
                  hTab === "my"
                    ? "border-red-500 bg-red-500/20"
                    : "border-slate-700"
                }`}
              >
                My Requests
              </button>
            </div>

            {hTab === "create" && (
              <form onSubmit={createRequest} className="card mt-6 space-y-4">

                <div>
                  <label className="text-slate-300 text-sm">
                    Blood Group
                  </label>
                  <select
                    value={newReq.bloodGroup}
                    onChange={(e) =>
                      setNewReq({ ...newReq, bloodGroup: e.target.value })
                    }
                    className="px-3 py-2 mt-1 bg-slate-900 border border-slate-700 rounded w-full"
                  >
                    <option value="">Select Blood Group</option>
                    {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Quantity"
                  type="number"
                  value={newReq.quantity}
                  onChange={(e) =>
                    setNewReq({ ...newReq, quantity: e.target.value })
                  }
                />

                <div className="flex flex-col text-sm">
                  <label className="text-slate-300">Urgency</label>
                  <select
                    value={newReq.urgency}
                    onChange={(e) =>
                      setNewReq({ ...newReq, urgency: e.target.value })
                    }
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <Input
                  label="City"
                  value={newReq.city}
                  onChange={(e) =>
                    setNewReq({ ...newReq, city: e.target.value })
                  }
                />

                <textarea
                  placeholder="Additional notes"
                  className="w-full h-20 bg-slate-900 border border-slate-700 rounded p-2 text-sm"
                  value={newReq.notes}
                  onChange={(e) =>
                    setNewReq({ ...newReq, notes: e.target.value })
                  }
                />

                <Button>Create Request</Button>
              </form>
            )}

            {hTab === "my" && (
              <div className="grid gap-4 mt-6">
                {myRequests.map((req) => (
                  <RequestCard
                    key={req._id}
                    request={req}
                    isHospital={true}
                    onViewResponders={(r) =>
                      router.push(`/requests/responders/${r._id}`)
                    }
                    onDelete={(id) => deleteRequest(id)}
                    onChangeStatus={(id, status) =>
                      changeStatus(id, status)
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
