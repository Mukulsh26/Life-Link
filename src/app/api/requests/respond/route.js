import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Request from "../../../../models/Request";
import User from "../../../../models/User";
import { getUserFromHeader } from "../../../../lib/auth";

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
    const hasResponded = request.responders.some(
      (r) => r.donor.toString() === donor._id.toString()
    );

    if (hasResponded) {
      return NextResponse.json(
        { message: "Already responded" },
        { status: 200 }
      );
    }

    // Add donor to responders list
    request.responders.push({
      donor: donor._id,
      respondedAt: new Date()
    });

    await request.save();

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
