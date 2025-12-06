import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Request from "../../../../models/Request";
import { getUserFromHeader } from "../../../../lib/auth";
import { pusherServer } from "../../../../lib/pusher";

export async function POST(req) {
  try {
    await connectDB();

    const authUser = getUserFromHeader(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only hospitals can create requests
    const hospital = await User.findById(authUser.id);
    if (!hospital || hospital.role !== "hospital") {
      return NextResponse.json(
        { error: "Only hospitals can create requests" },
        { status: 403 }
      );
    }

    // Read incoming JSON body
    let { bloodGroup, units, urgency, notes } = await req.json();

    bloodGroup = decodeURIComponent(bloodGroup || "").trim().toUpperCase();

    if (!bloodGroup) {
      return NextResponse.json(
        { error: "Blood group is required" },
        { status: 400 }
      );
    }

    // AUTO-USE hospital location
    const cleanCity = (hospital.city || "").trim().toLowerCase();
    const cleanState = hospital.state || "";
    const cleanPincode = hospital.pincode || "";
    const cleanAddress = hospital.address || "";
    const hospitalName = hospital.hospitalName || "";

    // Create DB entry
    const reqDoc = await Request.create({
      hospital: hospital._id,
      hospitalName,
      bloodGroup,
      units: units || 1,
      urgency: urgency || "medium",
      city: cleanCity,
      state: cleanState,
      pincode: cleanPincode,
      address: cleanAddress,
      notes,
    });

    // 🔥 PUSHER EVENT
    await pusherServer.trigger("blood-requests", "new-request", {
      requestId: reqDoc._id.toString(),
      city: cleanCity,
      bloodGroup,
      urgency,
      hospitalName,
    });

    // 🔥 FCM Notif
    const donors = await User.find({
      role: "donor",
      city: cleanCity,
      bloodGroup,
      deviceToken: { $exists: true, $ne: null },
    });

    const tokens = donors.map((d) => d.deviceToken).filter(Boolean);

    if (tokens.length > 0 && process.env.FCM_SERVER_KEY) {
      try {
        await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=${process.env.FCM_SERVER_KEY}`,
          },
          body: JSON.stringify({
            registration_ids: tokens,
            notification: {
              title: `${bloodGroup} Blood Needed`,
              body: `${hospitalName}, ${cleanCity} (${urgency})`,
            },
          }),
        });
      } catch (err) {
        console.error("Error sending FCM:", err);
      }
    }

    return NextResponse.json(
      { message: "Request created", requestId: reqDoc._id },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create Request Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
