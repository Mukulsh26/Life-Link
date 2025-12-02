// src/app/api/auth/login/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { signToken } from "../../../../lib/auth";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create JWT
    const token = signToken({
      id: user._id,
      role: user.role,
      city: user.city,
      bloodGroup: user.bloodGroup,
    });

    // Safe user object for frontend
    const safeUser = {
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  bloodGroup: user.bloodGroup,
  city: user.city,
  hospitalName: user.hospitalName,
  contactNumber: user.contactNumber, // <-- add here
};

    // Return token in JSON (frontend will store in localStorage)
    return NextResponse.json({ token, user: safeUser }, { status: 200 });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
