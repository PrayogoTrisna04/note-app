import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Check if email is already registered
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create the user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  return res.status(201).json({ id: user.id, email: user.email });
}
