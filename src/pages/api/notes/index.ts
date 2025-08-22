import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getAuth(req, res);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  if (req.method === "GET") {
    try {
      const notes = await prisma.note.findMany({
        where: { visibility: "PUBLIC", deletedAt: null },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json(notes);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === "POST") {
    const { title, contentMd, visibility } = req.body;

    if (!title) return res.status(400).json({ error: "Title required" });

    const note = await prisma.note.create({
      data: {
        title,
        contentMd: contentMd || "",
        visibility: visibility || "PRIVATE",
        ownerId: user ? user.id : '',
      },
    });

    return res.status(201).json(note);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}

