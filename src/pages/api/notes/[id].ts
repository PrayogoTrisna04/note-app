import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query as { id: string };
    const user = getAuth(req, res);
    const userId = user ? user.id : "";
    // GET NOTE
    if (req.method === "GET") {
        const note = await prisma.note.findUnique({
            where: { id },
            include: {
                comments: {
                    include: {
                        author: { select: { id: true, name: true, email: true } },
                    },
                    orderBy: { createdAt: "asc" },
                },
                shares: true,
                owner: { select: { id: true, name: true } },
            },
        });

        if (!note) return res.status(404).json({ error: "Not found" });

        const isOwner = userId && note.ownerId === userId;
        const isShared = userId
            ? await prisma.sharedNote.findUnique({
                where: { noteId_userId: { noteId: id, userId } },
            })
            : null;
        const isPublic = note.visibility === "PUBLIC";

        if (!isPublic && !isOwner && !isShared) {
            return res.status(403).json({ error: "Forbidden" });
        }

        return res.status(200).json(note);
    }

    // UPDATE NOTE
    if (req.method === "PUT") {
        const session = await getAuth(req, res);
        const { title, contentMd, visibility } = req.body;

        const note = await prisma.note.findUnique({ where: { id } });
        if (!note) return res.status(404).json({ error: "Not found" });

        const shared = await prisma.sharedNote.findUnique({
            where: {
                noteId_userId: { noteId: id, userId: userId },
            },
        });

        const canEdit =
            note.ownerId === userId ||
            (shared && shared.permission === "EDIT");

        if (!canEdit) return res.status(403).json({ error: "Forbidden" });

        const updated = await prisma.note.update({
            where: { id },
            data: { title, contentMd, visibility },
        });

        return res.status(200).json(updated);
    }

    // DELETE NOTE
    if (req.method === "DELETE") {
        const session = await getAuth(req, res);

        const note = await prisma.note.findUnique({ where: { id } });
        if (!note) return res.status(404).json({ error: "Not found" });

        if (note.ownerId !== userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        await prisma.note.delete({ where: { id } });
        return res.status(204).end();
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end();
}
