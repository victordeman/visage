import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody, LoginResponse, LogoutResponse, RegisterBody } from "@workspace/api-zod";
import { signToken } from "../lib/jwt";
import { logger } from "../lib/logger";

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

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }

  const { firstName, lastName, email, password, role } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ message: "An account with this email already exists" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const name = `${firstName} ${lastName}`;

  const [inserted] = await db
    .insert(usersTable)
    .values({
      name,
      email,
      password: hashedPassword,
      role: role ?? "student",
      firstName,
      lastName,
      hasEmbedding: false,
    })
    .returning();

  req.log.info({ userId: inserted.id }, "New user registered");

  const token = signToken({ userId: inserted.id, role: inserted.role });
  res.status(201).json(
    LoginResponse.parse({
      access_token: token,
      role: inserted.role,
      userId: inserted.id,
      name: inserted.name,
    }),
  );
});

router.post("/auth/logout", (_req, res): void => {
  res.json(LogoutResponse.parse({ message: "Logged out successfully" }));
});

export async function seedDefaultUsers(): Promise<void> {
  try {
    const [existingVictor] = await db.select().from(usersTable).where(eq(usersTable.email, "victor"));
    if (!existingVictor) {
      const hash = await bcrypt.hash("victor@2026", 10);
      await db.insert(usersTable).values({
        name: "Victor",
        email: "victor",
        password: hash,
        role: "admin",
        firstName: "Victor",
        lastName: "Admin",
        hasEmbedding: false,
      });
      logger.info("Seeded default admin: victor");
    }

    const [existingMark] = await db.select().from(usersTable).where(eq(usersTable.email, "mark"));
    if (!existingMark) {
      const hash = await bcrypt.hash("mark@2026", 10);
      await db.insert(usersTable).values({
        name: "Mark",
        email: "mark",
        password: hash,
        role: "student",
        firstName: "Mark",
        lastName: "Student",
        hasEmbedding: false,
      });
      logger.info("Seeded default student: mark");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed default users");
  }
}

export default router;
