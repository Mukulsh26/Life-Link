// src/app/api/auth/google/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { signToken } from "../../../../lib/auth";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;    // e.g. http://localhost:3000/api/auth/google
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;       // e.g. http://localhost:3000

export async function GET(req) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const code = searchParams.get("code");
  const state = searchParams.get("state");       // from Google callback
  const modeFromQuery = searchParams.get("mode");
  const mode = state || modeFromQuery || "login"; // login or signup

  // STEP 1: redirect user to Google
  if (!code) {
    const googleURL =
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: "openid email profile",
        prompt: "select_account",
        state: mode, // keep mode through redirect
      }).toString();

    return NextResponse.redirect(googleURL);
  }

  // STEP 2: exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
      code,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.id_token) {
    return NextResponse.redirect(`${BASE_URL}/login?error=google_failed`);
  }

  const googleUser = jwt.decode(tokenData.id_token);
  if (!googleUser?.email) {
    return NextResponse.redirect(`${BASE_URL}/login?error=invalid_google_email`);
  }

  await connectDB();

  let user = await User.findOne({ email: googleUser.email });

  // mode=login → must EXIST
  // mode=login → login only
if (mode === "login") {
  if (!user) {
    return NextResponse.redirect(`${BASE_URL}/signup?error=no_account`);
  }
}


// mode=signup → signup only
if (mode === "signup") {
  if (user) {
    return NextResponse.redirect(`${BASE_URL}/login?error=already_exists`);
  }

  user = await User.create({
    name: googleUser.name || googleUser.email.split("@")[0],
    email: googleUser.email,
    password: null,
    role: null,
    profileCompleted: false,
  });
}



  // If still no user, give up
  if (!user) {
    return NextResponse.redirect(`${BASE_URL}/login?error=unexpected`);
  }

  // Create JWT with user id
  const token = signToken({ id: user._id, role: user.role });


  // Send to a unified callback
  const redirectUrl =
    `${BASE_URL}/redirect-after-login?token=${encodeURIComponent(token)}&mode=${mode}`;

  return NextResponse.redirect(redirectUrl);
}
