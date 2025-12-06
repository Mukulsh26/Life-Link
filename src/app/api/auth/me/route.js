// src/app/api/auth/me/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db"
import { getUserFromHeader } from "../../../../lib/auth";
import User from "../../../../models/User";

export async function GET(req) {
  await connectDB();

  const tokenUser = getUserFromHeader(req); // { id } from JWT
  if (!tokenUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findById(tokenUser.id).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const safeUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    bloodGroup: user.bloodGroup || null,
    city: user.city || null,
    hospitalName: user.hospitalName || null,
    contactNumber: user.contactNumber || null,
    profileCompleted: user.profileCompleted || false,
  };

  return NextResponse.json({ user: safeUser });
}
