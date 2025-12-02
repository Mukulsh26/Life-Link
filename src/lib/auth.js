// src/lib/auth.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

/**
 * Extracts user from Authorization header ("Bearer <token>")
 * Use this in API routes to get logged-in user.
 */
export function getUserFromHeader(req) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  return verifyToken(token);
}
