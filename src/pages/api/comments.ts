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

  const { noteId, content } = req.body as { noteId: string; content: string };

  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note) return res.status(404).json({ error: "Note not found" });

  let canComment = false;

  if (note.visibility === "PUBLIC") canComment = true;
  else if (note.ownerId === session.id) canComment = true;
  else {
    const shared = await prisma.sharedNote.findUnique({
      where: { noteId_userId: { noteId, userId: session.id } },
    });
    canComment = !!shared && ["COMMENT", "EDIT"].includes(shared.permission);
  }

  if (!canComment) return res.status(403).json({ error: "Forbidden" });

  const comment = await prisma.comment.create({
    data: {
      noteId,
      authorId: session.id,
      contentMd: content,
    },
  });

  return res.status(201).json(comment);
}
