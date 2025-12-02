import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Request from "../../../../models/Request";
import User from "../../../../models/User";
import { getUserFromHeader } from "../../../../lib/auth";
import { pusherServer } from "../../../../lib/pusher";

export async function POST(req) {
  try {
    await connectDB();

    const authUser = getUserFromHeader(req);
    if (!authUser || authUser.role !== "donor") {
      return NextResponse.json(
        { error: "Only donors can respond" },
        { status: 403 }
      );
    }

    const { requestId } = await req.json();

    const donor = await User.findById(authUser.id);
    const request = await Request.findById(requestId);

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Check if already responded
    const already = request.responders.some(
      (r) => r.donor.toString() === donor._id.toString()
    );

    if (already) {
      return NextResponse.json(
        { message: "Already responded" },
        { status: 200 }
      );
    }

    // Add to responders
    request.responders.push({
      donor: donor._id,
      respondedAt: new Date(),
    });

    await request.save();

    // ✅ SEND REAL-TIME UPDATE TO HOSPITAL USING PUSHER
    await pusherServer.trigger("blood-requests", "donor-responded", {
      requestId,
      donorId: donor._id,

      donor: {
        _id: donor._id,
        name: donor.name,
        email: donor.email,
        city: donor.city,
        bloodGroup: donor.bloodGroup,
        contactNumber: donor.contactNumber,
      },
    });

    return NextResponse.json(
      { message: "Response submitted!" },
      { status: 200 }
    );

  } catch (err) {
    console.error("Respond Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
