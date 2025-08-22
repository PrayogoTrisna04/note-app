import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }

  const session = await getAuth(req, res);
  if (!session?.id) return res.status(401).json({ error: "Unauthorized" });

  const { noteId, userId, permission } = req.body as {
    noteId: string;
    userId: string;
    permission: "READ" | "COMMENT" | "EDIT";
  };

  // Pastikan note owned by current user
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note) return res.status(404).json({ error: "Note not found" });
  if (note.ownerId !== session.id) return res.status(403).json({ error: "Forbidden" });

  // Create or update sharedNote
  const shared = await prisma.sharedNote.upsert({
    where: { noteId_userId: { noteId, userId } },
    update: { permission },
    create: { noteId, userId, permission },
  });

  return res.status(200).json(shared);
}
