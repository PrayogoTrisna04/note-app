import { parse } from "cookie";
import { verify } from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";

export interface Session {
  id: string;
  email: string;
}

export function getAuth(req: NextApiRequest, res: NextApiResponse): Session | null {
  const cookies = req.headers.cookie
    ? parse(req.headers.cookie)
    : {};

  const token = cookies.token;
  if (!token) return null;

  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as Session;
    return decoded;
  } catch (err) {
    return null;
  }
}
