// src/app/api/auth/login/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { signToken } from "../../../../lib/auth";

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();

  // Find user
  const user = await User.findOne({ email });
  if (!user || !user.password)
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  // Validate password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  // Create JWT
  const token = signToken({ id: user._id });

  // Prepare safe user object
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

  return NextResponse.json(
    {
      token,
      user: safeUser,
    },
    { status: 200 }
  );
}
