import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Request from "../../../../models/Request";
import { getUserFromHeader } from "../../../../lib/auth";

export async function GET(req) {
  try {
    await connectDB();

    const authUser = getUserFromHeader(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    // ⭐ FIXED: Extract query params
    const city = searchParams.get("city");
    const bloodGroup = searchParams.get("bloodGroup");

    // ⭐ DONOR LOGIC — MATCH CITY + BLOOD GROUP
    // Donor filtering
if (role === "donor") {
  const city = decodeURIComponent(searchParams.get("city") || "");
  const bloodGroup = decodeURIComponent(searchParams.get("bloodGroup") || "");

  const cleanCity = city.trim().toLowerCase();
  const cleanBG = bloodGroup.trim().toUpperCase();

  const requests = await Request.find({
    status: "active",
    city: cleanCity,
    bloodGroup: cleanBG,
  })
    .populate("hospital", "hospitalName city contactNumber")
    .sort({ createdAt: -1 });

  return NextResponse.json({ requests }, { status: 200 });
}


    // HOSPITAL → ONLY OWN REQUESTS
    if (role === "hospital") {
      const requests = await Request.find({ hospital: authUser.id })
        .populate("hospital", "hospitalName city contactNumber")
        .sort({ createdAt: -1 });

      return NextResponse.json({ requests }, { status: 200 });
    }

    // ADMIN / DEFAULT → ALL
    const all = await Request.find()
      .populate("hospital", "hospitalName city contactNumber")
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests: all }, { status: 200 });
  } catch (err) {
    console.error("List Requests Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
