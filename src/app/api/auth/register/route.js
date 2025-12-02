// src/app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";

export async function POST(req) {
  try {
    await connectDB();

    let body = await req.json();

    // ⭐ NORMALIZE USER INPUTS (VERY IMPORTANT)
    if (body.city) body.city = body.city.trim().toLowerCase();
    if (body.bloodGroup) body.bloodGroup = body.bloodGroup.trim().toUpperCase();
    if (body.hospitalName) body.hospitalName = body.hospitalName.trim();
    if (body.name) body.name = body.name.trim();

    const {
      name,
      email,
      password,
      role,
      bloodGroup,
      city,
      hospitalName,
      contactNumber,
    } = body;

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    // ⭐ Normalize role (fallback donor)
    const userRole = role === "hospital" ? "hospital" : "donor";

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: userRole,

      // ⭐ Donor-specific fields
      bloodGroup: userRole === "donor" ? bloodGroup : undefined,
      city,
      contactNumber,
      hospitalName: userRole === "hospital" ? hospitalName : undefined,
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
