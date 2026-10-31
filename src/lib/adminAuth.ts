import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.findUserById(session.userId);
  return user?.role === "ADMIN" ? user : null;
}
