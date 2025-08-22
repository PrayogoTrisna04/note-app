import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  res.status(200).json(users);
}
