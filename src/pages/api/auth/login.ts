// src/pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  // generate JWT
  const token = sign(
    { id: user.id, email: user.email },
    process.env.NEXTAUTH_SECRET!,
    { expiresIn: "1d" }
  );

  // set cookie HttpOnly
  const cookie = serialize("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // pakai HTTPS di prod
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 hari
  });

  res.setHeader("Set-Cookie", cookie);

  return res.status(200).json({ success: true });
}
