import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end();
  }

  const session = await getAuth(req, res);
  if (!session?.id) return res.status(401).json({ error: "Unauthorized" });

  const { q = "", page = "1", limit = "5" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // Query notes milik user
  const ownNotesQuery = {
    ownerId: session.id,
    OR: [
      { title: { contains: q as string, mode: "insensitive" as const } },
      { contentMd: { contains: q as string, mode: "insensitive" as const } },
    ],
  };

  // Query notes yang dishare ke user
  const sharedNotesQuery = {
    shares: {
      some: { userId: session.id },
    },
    OR: [
      { title: { contains: q as string, mode: "insensitive" as const } },
      { contentMd: { contains: q as string, mode: "insensitive" as const } },
    ],
  };

  // Ambil notes milik user
  const [ownTotal, ownNotes] = await Promise.all([
    prisma.note.count({ where: ownNotesQuery }),
    prisma.note.findMany({
      where: ownNotesQuery,
      include: { comments: true, shares: true },
      orderBy: { createdAt: "desc" },
      skip: 0,
      take: 1000, // ambil semua dulu, nanti pagination di frontend bisa
    }),
  ]);

const notesWithOwnerFlag = ownNotes.map(note => ({
  ...note,
  isOwner: note.ownerId === session.id
}));

  // Ambil notes yang dishare ke user
  const [sharedTotal, sharedNotes] = await Promise.all([
    prisma.note.count({ where: sharedNotesQuery }),
    prisma.note.findMany({
      where: sharedNotesQuery,
      include: { comments: true, shares: true },
      orderBy: { createdAt: "desc" },
      skip: 0,
      take: 1000,
    }),
  ]);

  // Gabung notes milik user dan shared
  const allNotes = [...notesWithOwnerFlag, ...sharedNotes];

  return res.status(200).json({
    notes: allNotes,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil((ownTotal + sharedTotal) / limitNum),
    total: ownTotal + sharedTotal,
  });
}
