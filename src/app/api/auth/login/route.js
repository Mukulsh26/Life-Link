import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { signToken } from "../../../../lib/auth";
import { verifyCaptcha } from "../../../../lib/verifyCaptcha";

export async function POST(req) {
  await connectDB();

  const { email, password, captchaToken } = await req.json();

  // ✅ Verify captcha
  const isHuman = await verifyCaptcha(captchaToken);
  if (!isHuman) {
    return NextResponse.json(
      { error: "Captcha failed. Try again." },
      { status: 400 }
    );
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user || !user.password) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Validate password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Create JWT
  const token = signToken({ id: user._id, role: user.role });

  const safeUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    bloodGroup: user.bloodGroup || null,
    city: user.city || null,
    state: user.state || null,
    pincode: user.pincode || null,
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
