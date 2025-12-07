"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Button from "../components/Button";
import RequestCard from "../components/RequestCard";

import { toast } from "sonner";
import { requestFcmToken } from "../../lib/firebase";
import { pusherClient } from "../../lib/pusher-client";
import { useLoader } from "../context/LoaderContext";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function Dashboard() {
  const { setLoading } = useLoader();
  const router = useRouter();

  const [user, setUser] = useState(null);

  const [tab, setTab] = useState("requests");
  const [hTab, setHTab] = useState("create");

  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [history, setHistory] = useState([]);

  const [newReq, setNewReq] = useState({
    bloodGroup: "",
    units: 1,
    urgency: "medium",
    notes: "",
  });

  const [deleteId, setDeleteId] = useState(null);

  const askDelete = (id) => {
    setDeleteId(id);   // open modal
  };

  const confirmDelete = async () => {
    await deleteRequest(deleteId); // your old function
    setDeleteId(null);             // close modal
  };

  // ---------------------------------------------------------
  // LOAD USER + INITIAL REQUESTS
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
  // FCM TOKEN REGISTRATION
  // ---------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    const setup = async () => {
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
      } catch {}
    };

    setup();
  }, [user]);

  // ---------------------------------------------------------
  // REAL-TIME DONOR
  // ---------------------------------------------------------
  useEffect(() => {
    if (!user || user.role !== "donor") return;

    const channel = pusherClient.subscribe("blood-requests");

    channel.bind("new-request", () => {
      loadDonorRequests(user, localStorage.getItem("lifelink_token"));
    });

    channel.bind("delete-request", (data) => {
      setRequests((prev) => prev.filter((r) => r._id !== data.requestId));
    });

    channel.bind("status-change", (data) => {
      setRequests((prev) =>
        prev.map((r) => (r._id === data.requestId ? { ...r, status: data.status } : r))
      );
    });

    return () => channel.unsubscribe();
  }, [user]);

  // ---------------------------------------------------------
  // REAL-TIME HOSPITAL
  // ---------------------------------------------------------
  useEffect(() => {
    if (!user || user.role !== "hospital") return;

    const channel = pusherClient.subscribe("blood-requests");

    channel.bind("donor-responded", (data) => {
      setMyRequests((prev) =>
        prev.map((r) =>
          r._id === data.requestId
            ? { ...r, responders: [...(r.responders || []), data.donor] }
            : r
        )
      );
    });

    channel.bind("delete-request", (data) => {
      setMyRequests((prev) => prev.filter((r) => r._id !== data.requestId));
    });

    channel.bind("status-change", (data) => {
      setMyRequests((prev) =>
        prev.map((r) => (r._id === data.requestId ? { ...r, status: data.status } : r))
      );
    });

    return () => channel.unsubscribe();
  }, [user]);

  // ---------------------------------------------------------
  // HISTORY LOADER
  // ---------------------------------------------------------
  useEffect(() => {
    if (!user) return;
    loadHistory();
  }, [tab, hTab]);

  // ---------------------------------------------------------
  // LOAD DONOR REQUESTS
  // ---------------------------------------------------------
  const loadDonorRequests = async (u, token) => {
    try {
      setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // LOAD HOSPITAL REQUESTS
  // ---------------------------------------------------------
  const loadHospitalRequests = async (token) => {
    try {
      setLoading(true);

      const res = await fetch(`/api/requests/list?role=hospital`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setMyRequests(data.requests);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // LOAD HISTORY
  // ---------------------------------------------------------
  const loadHistory = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("lifelink_token");

      const endpoint =
        user.role === "donor"
          ? "/api/history/donor"
          : "/api/history/hospital";

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) setHistory(data.history);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // CREATE REQUEST
  // ---------------------------------------------------------
  const createRequest = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem("lifelink_token");

      const payload = {
        bloodGroup: newReq.bloodGroup,
        units: newReq.units,
        urgency: newReq.urgency,
        notes: newReq.notes,
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

      if (!res.ok) return toast.error(data.error);

      toast.success("Request created");
      loadHospitalRequests(token);

      setNewReq({
        bloodGroup: "",
        units: 1,
        urgency: "medium",
        notes: "",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // DONOR RESPOND
  // ---------------------------------------------------------
  const respond = async (id) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // DELETE REQUEST
  // ---------------------------------------------------------
  const deleteRequest = async (id) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // CHANGE STATUS
  // ---------------------------------------------------------
  const changeStatus = async (id, status) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  if (!user) return null;

  // ---------------------------------------------------------
  // DASHBOARD UI
  // ---------------------------------------------------------
  return (
  <main className="min-h-screen bg-slate-950 text-white">
    <Navbar />

    <div className="max-w-6xl mx-auto px-4 pt-10">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Welcome,
          <span className="text-red-500 ml-2">
            {user.role === "hospital" ? user.hospitalName : user.name}!
          </span>
        </h1>

        <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest">
          {user.role} Dashboard
        </p>

        {/* Underline Glow */}
        <div className="w-24 h-1 bg-red-600 mx-auto mt-3 rounded-full shadow-red-500/50 shadow-lg"></div>
      </div>

      {/* --------------------------------------------------- */}
      {/* DONOR DASHBOARD */}
      {/* --------------------------------------------------- */}
      {user.role === "donor" && (
        <>
          {/* TABS */}
          <div className="flex gap-4 justify-center mb-8">
            {[
              ["requests", "Matching Requests"],
              ["profile", "Profile"],
              ["history", "History"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`
                  px-5 py-2 rounded-xl text-sm font-semibold transition-all backdrop-blur-md
                  ${tab === key
                    ? "bg-red-600/30 border border-red-500 shadow-lg shadow-red-800/40 text-red-300"
                    : "bg-slate-900/40 border border-slate-700 hover:border-red-500 hover:bg-slate-800/50"}
                `}
              >
                {label}
              </button>
            ))}
          </div>

          {/* MATCHING REQUESTS */}
          {tab === "requests" && (
            <div className="grid gap-5">
              {requests.length === 0 && (
                <p className="text-slate-400 text-center">No matching requests found.</p>
              )}

              {requests.map((req) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <RequestCard
                    request={req}
                    isDonor
                    onRespond={() => respond(req._id)}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* PROFILE */}
          {tab === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-xl"
            >
              <h2 className="text-2xl font-bold text-red-400 mb-4">Your Profile</h2>

              <div className="space-y-4">
                {[
                  ["Name", user.name],
                  ["Email", user.email],
                  ["Location", `${user.city}, ${user.state} - ${user.pincode}`],
                  ["Blood Group", user.bloodGroup],
                  ["Contact Number", user.contactNumber],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between border-b border-slate-800 pb-2"
                  >
                    <span className="text-slate-400">{label}</span>
                    <span className="font-semibold text-slate-200">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-red-600/20 text-red-300 p-4 rounded-lg text-center">
                ❤️ Thank you for being a life-saving donor!
              </div>
            </motion.div>
          )}

          {/* DONOR HISTORY */}
          {tab === "history" && (
            <div className="grid gap-4 mt-6">
              {history.length === 0 && (
                <p className="text-slate-500 text-center">No history yet.</p>
              )}

              {history.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="p-5 bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-xl shadow-lg"
                >
                  <p className="font-semibold text-red-400 text-lg">
                    {item.bloodGroup} Required
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {item.city} • {new Date(item.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Hospital: {item.hospital?.hospitalName}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* --------------------------------------------------- */}
      {/* HOSPITAL DASHBOARD */}
      {/* --------------------------------------------------- */}
      {user.role === "hospital" && (
        <>
          {/* TABS */}
          <div className="flex gap-4 justify-center mb-8">
            {[
              ["create", "Create Request"],
              ["my", "My Requests"],
              ["history", "History"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setHTab(key)}
                className={`
                  px-5 py-2 rounded-xl text-sm font-semibold transition-all backdrop-blur-md
                  ${hTab === key
                    ? "bg-red-600/30 border border-red-500 shadow-lg shadow-red-800/40 text-red-300"
                    : "bg-slate-900/40 border border-slate-700 hover:border-red-500 hover:bg-slate-800/50"}
                `}
              >
                {label}
              </button>
            ))}
          </div>

          {/* CREATE REQUEST */}
          {hTab === "create" && (
            <motion.form
              onSubmit={createRequest}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl mb-10 bg-slate-900/60 backdrop-blur-md border border-slate-700 shadow-xl space-y-5"
            >
              <h2 className="text-2xl font-bold text-red-400">Create New Request</h2>

              <div>
                <label className="text-slate-300 text-sm">Blood Group</label>
                <select
                  value={newReq.bloodGroup}
                  onChange={(e) => setNewReq({ ...newReq, bloodGroup: e.target.value })}
                  className="px-3 py-2 mt-1 bg-slate-950 border border-slate-700 rounded w-full"
                >
                  <option value="">Select</option>
                  {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Units"
                type="number"
                value={newReq.units}
                onChange={(e) => setNewReq({ ...newReq, units: e.target.value })}
              />

              <div>
                <label className="text-slate-300 text-sm">Urgency</label>
                <select
                  value={newReq.urgency}
                  onChange={(e) => setNewReq({ ...newReq, urgency: e.target.value })}
                  className="px-3 py-2 bg-slate-950 border border-slate-700 rounded mt-1 w-full"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <textarea
                placeholder="Additional notes..."
                className="w-full h-24 bg-slate-950 border border-slate-700 rounded p-2 text-sm"
                value={newReq.notes}
                onChange={(e) => setNewReq({ ...newReq, notes: e.target.value })}
              />

              <Button>Create Request</Button>
            </motion.form>
          )}

          {/* MY REQUESTS */}
          {hTab === "my" && (
            <div className="grid gap-5 mt-6">
              {myRequests.map((req) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <RequestCard
                    request={req}
                    isHospital
                    onViewResponders={(r) => router.push(`/requests/responders/${r._id}`)}
                    onDelete={() => askDelete(req._id)}
                    onChangeStatus={(id, status) => changeStatus(id, status)}
                  />
                </motion.div>
              ))}

              <DeleteConfirmModal
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
              />
            </div>
          )}

          {/* HOSPITAL HISTORY */}
          {hTab === "history" && (
            <div className="grid gap-4 mt-6">
              {history.length === 0 && (
                <p className="text-slate-400 text-center">No history yet.</p>
              )}

              {history.map((r) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="p-5 bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-xl shadow-lg"
                >
                  <p className="font-semibold text-red-400">{r.bloodGroup} • {r.city}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-red-300 mt-2">
                    Responders: {r.responders?.length}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  </main>
);

}
