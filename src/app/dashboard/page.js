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
import { useLoader } from "../context/LoaderContext";

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

  <button
    onClick={() => setTab("history")}
    className={`px-3 py-2 rounded-lg border ${
      tab === "history"
        ? "border-red-500 bg-red-500/20"
        : "border-slate-700"
    }`}
  >
    History
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
                    ["Location", `${user.city}, ${user.state} - ${user.pincode}`],
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

             {tab === "history" && (
  <div className="grid gap-4 mt-6">
    {history.length === 0 && (
      <p className="text-slate-400">No history yet.</p>
    )}

    {history.map((r) => (
      <div
        key={r._id}
        className="p-4 bg-slate-900 border border-slate-800 rounded-xl"
      >
        <p className="font-semibold text-red-400">
          {r.bloodGroup} needed
        </p>

        <p className="text-sm text-slate-400 mt-1">
          {r.city} • {new Date(r.createdAt).toLocaleString()}
        </p>

        <p className="text-xs text-slate-500 mt-2">
          Hospital: {r.hospital?.hospitalName}
        </p>
      </div>
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

  <button
    onClick={() => setHTab("history")}
    className={`px-3 py-2 rounded-lg border ${
      hTab === "history"
        ? "border-red-500 bg-red-500/20"
        : "border-slate-700"
    }`}
  >
    History
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
                  label="Units"
                  type="number"
                  value={newReq.units}
                  onChange={(e) =>
                    setNewReq({ ...newReq, units: e.target.value })
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

            {hTab === "history" && (
  <div className="grid gap-4 mt-6">
    {history.length === 0 && (
      <p className="text-slate-400">No requests created yet.</p>
    )}

    {history.map((r) => (
      <div
        key={r._id}
        className="p-4 bg-slate-900 border border-slate-800 rounded-xl"
      >
        <p className="font-semibold text-red-400">
          {r.bloodGroup} • {r.city}
        </p>

        <p className="text-sm text-slate-400 mt-1">
          {new Date(r.createdAt).toLocaleString()}
        </p>

        <p className="text-sm text-red-300 mt-2">
          Responders: {r.responders?.length}
        </p>
      </div>
    ))}
  </div>
)}
          </>
        )}
      </div>
    </main>
  );
}
