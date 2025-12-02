"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import Button from "../components/Button";
import RequestCard from "../components/RequestCard";
import { toast } from "sonner";
import { requestFcmToken } from "../../lib/firebase"
import { pusherClient } from "../../lib/pusher-client";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [tab, setTab] = useState("requests"); // Donor tabs
  const [hTab, setHTab] = useState("create"); // Hospital tabs

  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  const [newReq, setNewReq] = useState({
    bloodGroup: "",
    quantity: 1,
    urgency: "medium",
    city: "",
    notes: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("lifelink_token");
    const u = JSON.parse(localStorage.getItem("lifelink_user") || "{}");

    if (!token || !u) {
      router.push("/login");
      return;
    }

    setUser(u);

    if (u.role === "donor") loadDonorRequests(u, token);
    if (u.role === "hospital") loadHospitalRequests(token);
  }, []);

  // existing useEffect where you load user is fine; now add:

useEffect(() => {
  if (!user) return;

  const setupFcm = async () => {
    try {
      const token = await requestFcmToken();
      if (!token) return;

      const jwt = localStorage.getItem("lifelink_token");

      await fetch("/api/user/device-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ deviceToken: token }),
      });

      console.log("Device token saved to backend");
    } catch (err) {
      console.error(err);
      toast.error("Failed to register for notifications");
    }
  };

  setupFcm();
}, [user]);

useEffect(() => {
  if (!user || user.role !== "donor") return;

  const channel = pusherClient.subscribe("blood-requests");

  // NEW REQUEST
  channel.bind("new-request", (data) => {
    if (
      data.city === user.city.toLowerCase() &&
      data.bloodGroup === user.bloodGroup.toUpperCase()
    ) {
      loadDonorRequests(user, localStorage.getItem("lifelink_token"));
    }
  });

  // DELETE REQUEST
  channel.bind("delete-request", (data) => {
    setRequests((prev) => prev.filter((r) => r._id !== data.requestId));
  });

  // STATUS CHANGE (INACTIVE)
  channel.bind("status-change", (data) => {
    setRequests((prev) =>
      prev.map((r) =>
        r._id === data.requestId
          ? { ...r, status: data.status }
          : r
      )
    );
  });

  return () => {
    pusherClient.unsubscribe("blood-requests");
  };
}, [user]);


useEffect(() => {
  if (!user || user.role !== "hospital") return;

  const channel = pusherClient.subscribe("blood-requests");

  // DELETE
  channel.bind("delete-request", (data) => {
    setMyRequests((prev) => prev.filter((r) => r._id !== data.requestId));
  });

  // STATUS CHANGE
  channel.bind("status-change", (data) => {
    setMyRequests((prev) =>
      prev.map((r) =>
        r._id === data.requestId
          ? { ...r, status: data.status }
          : r
      )
    );
  });

  return () => {
    pusherClient.unsubscribe("blood-requests");
  };
}, [user]);



  const loadDonorRequests = async (u, token) => {
    const res = await fetch(
      `/api/requests/list?role=donor&city=${encodeURIComponent(
        u.city
      )}&bloodGroup=${encodeURIComponent(u.bloodGroup)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();
    if (res.ok) {
      // Add helper flag to mark if current donor already responded
      const withFlags = data.requests.map((r) => ({
        ...r,
        responded: r.responders?.some(
          (p) => p.donor === u._id || p.donor?._id === u._id
        ),
      }));

      setRequests(withFlags);
    }
  };

  const loadHospitalRequests = async (token) => {
    const res = await fetch(`/api/requests/list?role=hospital`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) setMyRequests(data.requests);
  };

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
    toast.error(data.error || "Failed to create request");
    return;
  }

  toast.success("Request created successfully!");
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

  try {
    const res = await fetch("/api/requests/respond", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId: id }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to submit response");
      return;
    }

    toast.success("Response submitted!");
    loadDonorRequests(user, token); // refresh donor requests
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  }
};


  const deleteRequest = async (id) => {
  const token = localStorage.getItem("lifelink_token");

  try {
    const res = await fetch("/api/requests/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId: id }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to delete request");
      return;
    }

    toast.success("Request deleted successfully");
    loadHospitalRequests(token);
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  }
};


  const changeStatus = async (id, status) => {
  const token = localStorage.getItem("lifelink_token");

  try {
    const res = await fetch("/api/requests/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId: id, status }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to update status");
      return;
    }

    toast.success(`Status updated to: ${status}`);
    loadHospitalRequests(token);
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  }
};


  if (!user) return null;

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* ⭐ WELCOME MESSAGE */}
        <h1 className="text-3xl font-bold mb-2">
          Welcome {user.role === "hospital" ? user.hospitalName : user.name}!
        </h1>

        <p className="text-slate-400 mb-6 capitalize">Role: {user.role}</p>

        {/* DONOR DASHBOARD */}
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
                  <p className="text-slate-400">
                    No matching requests found.
                  </p>
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

    <h2 className="text-xl font-bold text-red-400 mb-4">Your Profile</h2>

    <div className="space-y-3 text-sm">

      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-slate-400">Name</span>
        <span className="font-semibold text-slate-200">{user.name}</span>
      </div>

      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-slate-400">Email</span>
        <span className="font-semibold text-slate-200">{user.email}</span>
      </div>

      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-slate-400">City</span>
        <span className="font-semibold text-slate-200">{user.city}</span>
      </div>

      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-slate-400">Blood Group</span>
        <span className="font-semibold text-red-400">{user.bloodGroup}</span>
      </div>

      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-slate-400">Contact Number</span>
        <span className="font-semibold text-red-400">{user.contactNumber}</span>
      </div>

      <div className="mt-4 bg-red-600/20 text-red-300 p-3 rounded-lg text-center text-xs font-medium">
        Thank you for being a life-saving donor ❤️
      </div>
    </div>
  </div>
)}
          </>
        )}

        {/* HOSPITAL DASHBOARD */}
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
                {/* ⭐ BLOOD GROUP DROPDOWN */}
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
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
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
