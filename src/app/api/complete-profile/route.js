import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import { getUserFromHeader, signToken } from "../../../lib/auth";

export async function POST(req) {
  try {
    await connectDB();

    const tokenUser = getUserFromHeader(req);
    if (!tokenUser) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
  role,
  city,
  state,
  address,
  pincode,
  bloodGroup,
  hospitalName,
  contactNumber,
  lastDonationDate,
} = body;

    const user = await User.findById(tokenUser.id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // -------------------------
    // UPDATE ALL FIELDS
    // -------------------------
    user.role = role || user.role;
    user.city = city || null;
    user.state = state || null;
    user.address = address || null;
    user.pincode = pincode || null;
    user.contactNumber = contactNumber || null;
    user.lastDonationDate = lastDonationDate || null;

    if (role === "donor") {
      user.bloodGroup = bloodGroup || null;
    }

    if (role === "hospital") {
      user.hospitalName = hospitalName || null;
    }

    user.profileCompleted = true;
    await user.save();

    // New JWT containing updated role
    const newToken = signToken({ id: user._id, role: user.role });

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      state: user.state,
      address: user.address,
      pincode: user.pincode,
      bloodGroup: user.bloodGroup,
      hospitalName: user.hospitalName,
      contactNumber: user.contactNumber,
      profileCompleted: true,
    };

    return NextResponse.json(
      {
        success: true,
        token: newToken,
        user: safeUser,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Complete Profile Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
