import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Request from "../../../../models/Request";
import User from "../../../../models/User";
import { getUserFromHeader } from "../../../../lib/auth";
import { pusherServer } from "../../../../lib/pusher";  // <-- ADD

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
        { error: "Only hospitals can modify status" },
        { status: 403 }
      );
    }

    const { requestId, status } = await req.json();

    if (!["active", "cancelled", "fulfilled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const reqDoc = await Request.findById(requestId);
    if (!reqDoc) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (reqDoc.hospital.toString() !== hospital._id.toString()) {
      return NextResponse.json(
        { error: "Not allowed — not your request" },
        { status: 403 }
      );
    }

    reqDoc.status = status;
    await reqDoc.save();

    // 🔥 REALTIME PUSHER EVENT — update all dashboards
    await pusherServer.trigger("blood-requests", "status-change", {
      requestId,
      status,
    });

    return NextResponse.json(
      { message: "Status updated", status },
      { status: 200 }
    );
  } catch (err) {
    console.error("Status Update Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
