import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end();
  }

  const { q = "", page = "1", limit = "5" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const where = {
    visibility: "PUBLIC" as const,
    OR: [
      { title: { contains: q as string, mode: "insensitive" as const } },
      { contentMd: { contains: q as string, mode: "insensitive" as const } },
    ],
  };

  const [total, notes] = await Promise.all([
    prisma.note.count({ where }),
    prisma.note.findMany({
      where,
      select: {
        id: true,
        title: true,
        contentMd: true,
        comments: { select: { contentMd: true } },
        owner: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
  ]);

  return res.status(200).json({
    notes,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    total,
  });
}
