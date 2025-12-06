// src/app/api/requests/responders/route.js
import { NextResponse } from "next/server"; 
import { connectDB } from "../../../../lib/db"; 
import Request from "../../../../models/Request"; 
import User from "../../../../models/User"; 
import { getUserFromHeader } from "../../../../lib/auth";

export async function POST(req) {
  try {
    await connectDB();

    // Extract token user (only contains {id})
    const tokenUser = getUserFromHeader(req);
    if (!tokenUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load full user from DB
    const user = await User.findById(tokenUser.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only hospitals can view responders
    if (user.role !== "hospital") {
      return NextResponse.json(
        { error: "Only hospitals can view responders" },
        { status: 403 }
      );
    }

    const { requestId } = await req.json();

    const request = await Request.findById(requestId).populate(
      "responders.donor",
      "name email city contactNumber bloodGroup"
    );

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(
      { responders: request.responders },
      { status: 200 }
    );

  } catch (err) {
    console.error("Responders Fetch Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
