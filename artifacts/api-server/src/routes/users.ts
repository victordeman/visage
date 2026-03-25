import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListUsersResponse,
  GetUserParams,
  GetUserResponse,
  DeleteUserParams,
  DeleteUserResponse,
  GetUserProfileResponse,
  EnrollUserBody,
  FaceMatchBody,
  FaceMatchResponse,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/users/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(
    GetUserProfileResponse.parse({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department,
      jobDesignation: user.jobDesignation,
      homeAddress: user.homeAddress,
      dob: user.dob,
      hasEmbedding: user.hasEmbedding,
      imagePath: user.imagePath,
      createdAt: user.createdAt.toISOString(),
    }),
  );
});

router.get("/users", requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable);
  res.json(
    ListUsersResponse.parse(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
        department: u.department,
        jobDesignation: u.jobDesignation,
        homeAddress: u.homeAddress,
        dob: u.dob,
        hasEmbedding: u.hasEmbedding,
        imagePath: u.imagePath,
        createdAt: u.createdAt.toISOString(),
      })),
    ),
  );
});

router.post("/users/enroll", requireAuth, async (req, res): Promise<void> => {
  const parsed = EnrollUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }

  const { firstName, lastName, email, password, role, department, jobDesignation, homeAddress, dob, faceDescriptor } =
    parsed.data;

  // Only admins can enroll others or create admin accounts
  if (req.user!.role !== "admin" && role === "admin") {
    res.status(403).json({ message: "Only admins can create admin accounts" });
    return;
  }

  // Check existing
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ message: "Email already registered" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password ?? "defaultpass", 10);
  const name = `${firstName} ${lastName}`;
  const descriptorJson = JSON.stringify(faceDescriptor);

  const [inserted] = await db
    .insert(usersTable)
    .values({
      name,
      email,
      password: hashedPassword,
      role: role ?? "student",
      firstName,
      lastName,
      department,
      jobDesignation,
      homeAddress,
      dob,
      faceDescriptor: descriptorJson,
      hasEmbedding: true,
    })
    .returning();

  res.status(201).json({ message: "User enrolled successfully", userId: inserted.id });
});

router.post("/users/face-match", requireAuth, async (req, res): Promise<void> => {
  const parsed = FaceMatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }

  const { descriptor } = parsed.data;

  const users = await db.select().from(usersTable).where(eq(usersTable.hasEmbedding, true));

  let bestMatch: { userId: number; userName: string; distance: number; role: string } | null = null;

  for (const user of users) {
    if (!user.faceDescriptor) continue;
    try {
      const stored: number[] = JSON.parse(user.faceDescriptor);
      if (stored.length !== descriptor.length) continue;

      // Euclidean distance
      let sum = 0;
      for (let i = 0; i < stored.length; i++) {
        const diff = stored[i] - descriptor[i];
        sum += diff * diff;
      }
      const distance = Math.sqrt(sum);

      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = { userId: user.id, userName: user.name, distance, role: user.role };
      }
    } catch {
      continue;
    }
  }

  const THRESHOLD = 0.5;
  if (bestMatch && bestMatch.distance < THRESHOLD) {
    res.json(
      FaceMatchResponse.parse({
        matched: true,
        userId: bestMatch.userId,
        userName: bestMatch.userName,
        distance: bestMatch.distance,
        role: bestMatch.role,
      }),
    );
  } else {
    res.json(FaceMatchResponse.parse({ matched: false, userId: null, userName: null, distance: null, role: null }));
  }
});

router.get("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(
    GetUserResponse.parse({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department,
      jobDesignation: user.jobDesignation,
      homeAddress: user.homeAddress,
      dob: user.dob,
      hasEmbedding: user.hasEmbedding,
      imagePath: user.imagePath,
      createdAt: user.createdAt.toISOString(),
    }),
  );
});

router.delete("/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(DeleteUserResponse.parse({ message: "User deleted successfully" }));
});

export default router;
