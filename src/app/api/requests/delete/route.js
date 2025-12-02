import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Request from "../../../../models/Request";
import User from "../../../../models/User";
import { getUserFromHeader } from "../../../../lib/auth";
import { pusherServer } from "../../../../lib/pusher";   // <-- ADD

export async function POST(req) {
  try {
    await connectDB();

    const authUser = getUserFromHeader(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hospital = await User.findById(authUser.id);
    if (!hospital || hospital.role !== "hospital") {
      return NextResponse.json(
        { error: "Only hospitals can delete requests" },
        { status: 403 }
      );
    }

    const { requestId } = await req.json();

    const existing = await Request.findById(requestId);
    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (existing.hospital.toString() !== hospital._id.toString()) {
      return NextResponse.json(
        { error: "Not allowed — this request does not belong to your hospital" },
        { status: 403 }
      );
    }

    await Request.deleteOne({ _id: requestId });

    // 🔥 REALTIME PUSHER EVENT — NOTIFY DONOR + HOSPITAL
    await pusherServer.trigger("blood-requests", "delete-request", {
      requestId,
    });

    return NextResponse.json(
      { message: "Request deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Delete Request Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
