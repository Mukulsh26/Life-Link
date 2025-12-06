import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Request from "../../../../models/Request";
import { getUserFromHeader } from "../../../../lib/auth";

export async function GET(req) {
  try {
    await connectDB();

    const authUser = getUserFromHeader(req);
    if (!authUser || authUser.role !== "hospital") {
      return NextResponse.json(
        { error: "Only hospitals can view this" },
        { status: 403 }
      );
    }

    const requests = await Request.find({
      hospital: authUser.id,
    })
      .populate("responders.donor", "name city bloodGroup contactNumber email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ history: requests }, { status: 200 });
  } catch (err) {
    console.error("Hospital History Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
