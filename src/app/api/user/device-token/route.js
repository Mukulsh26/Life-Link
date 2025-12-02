import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db"
import User from "../../../../models/User"
import { getUserFromHeader } from "../../../../lib/auth"

export async function POST(req) {
  try {
    await connectDB();

    const auth = getUserFromHeader(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deviceToken } = await req.json();
    if (!deviceToken) {
      return NextResponse.json(
        { error: "Missing device token" },
        { status: 400 }
      );
    }

    await User.findByIdAndUpdate(auth.id, { deviceToken });

    return NextResponse.json({ message: "Device token saved" }, { status: 200 });
  } catch (err) {
    console.error("Save device token error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
