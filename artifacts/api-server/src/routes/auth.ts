import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody, LoginResponse, LogoutResponse } from "@workspace/api-zod";
import { signToken } from "../lib/jwt";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json(
    LoginResponse.parse({
      access_token: token,
      role: user.role,
      userId: user.id,
      name: user.name,
    }),
  );
});

router.post("/auth/logout", (_req, res): void => {
  res.json(LogoutResponse.parse({ message: "Logged out successfully" }));
});

export default router;
