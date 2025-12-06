import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import { getUserFromHeader } from "../../../lib/auth";

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
    const { role, city, bloodGroup, hospitalName, contactNumber } = body;

    const user = await User.findById(tokenUser.id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update fields
    user.role = role || user.role;
    user.city = city || null;
    user.bloodGroup = bloodGroup || null;
    user.hospitalName = hospitalName || null;
    user.contactNumber = contactNumber || null;

    user.profileCompleted = true;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        bloodGroup: user.bloodGroup,
        hospitalName: user.hospitalName,
        contactNumber: user.contactNumber,
        profileCompleted: true,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
