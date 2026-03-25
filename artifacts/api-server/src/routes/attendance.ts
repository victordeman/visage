import { Router, type IRouter } from "express";
import { db, attendanceTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  ListAttendanceQueryParams,
  ListAttendanceResponse,
  MarkAttendanceBody,
  MarkAttendanceResponse,
  GetUserStatsResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

router.get("/users/stats", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;

  const records = await db.select().from(attendanceTable).where(eq(attendanceTable.userId, userId));
  const present = records.filter((r) => r.status === "present" || r.status === "late").length;
  const total = records.length;
  const absent = total - present;
  const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;

  res.json(GetUserStatsResponse.parse({ present, absent, total, presentPercentage }));
});

router.get("/attendance", requireAuth, async (req, res): Promise<void> => {
  const queryParsed = ListAttendanceQueryParams.safeParse(req.query);
  const userId = req.user!.userId;
  const role = req.user!.role;

  let records;

  if (role === "admin") {
    // Admins see all records, optionally filtered by userId or date
    const filterUserId = queryParsed.success ? queryParsed.data.userId : undefined;
    const filterDate = queryParsed.success ? queryParsed.data.date : undefined;

    const query = db
      .select({
        id: attendanceTable.id,
        userId: attendanceTable.userId,
        userName: usersTable.name,
        timestamp: attendanceTable.timestamp,
        status: attendanceTable.status,
        date: attendanceTable.date,
      })
      .from(attendanceTable)
      .leftJoin(usersTable, eq(attendanceTable.userId, usersTable.id));

    if (filterUserId) {
      records = await query.where(eq(attendanceTable.userId, filterUserId)).orderBy(desc(attendanceTable.timestamp));
    } else if (filterDate) {
      records = await query.where(eq(attendanceTable.date, filterDate)).orderBy(desc(attendanceTable.timestamp));
    } else {
      records = await query.orderBy(desc(attendanceTable.timestamp));
    }
  } else {
    // Students see their own records
    records = await db
      .select({
        id: attendanceTable.id,
        userId: attendanceTable.userId,
        userName: usersTable.name,
        timestamp: attendanceTable.timestamp,
        status: attendanceTable.status,
        date: attendanceTable.date,
      })
      .from(attendanceTable)
      .leftJoin(usersTable, eq(attendanceTable.userId, usersTable.id))
      .where(eq(attendanceTable.userId, userId))
      .orderBy(desc(attendanceTable.timestamp));
  }

  res.json(
    ListAttendanceResponse.parse(
      records.map((r) => ({
        id: r.id,
        userId: r.userId,
        userName: r.userName ?? undefined,
        timestamp: r.timestamp.toISOString(),
        status: r.status,
        date: r.date,
      })),
    ),
  );
});

router.post("/attendance/mark", requireAuth, async (req, res): Promise<void> => {
  const parsed = MarkAttendanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }

  const { userId, status } = parsed.data;

  // Check if already marked today
  const today = todayDate();
  const [existing] = await db
    .select()
    .from(attendanceTable)
    .where(and(eq(attendanceTable.userId, userId), eq(attendanceTable.date, today)));

  if (existing) {
    // Return existing record
    const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, userId));
    res.json(
      MarkAttendanceResponse.parse({
        id: existing.id,
        userId: existing.userId,
        userName: user?.name,
        timestamp: existing.timestamp.toISOString(),
        status: existing.status,
        date: existing.date,
      }),
    );
    return;
  }

  const [record] = await db
    .insert(attendanceTable)
    .values({ userId, status, date: today })
    .returning();

  const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, userId));

  res.json(
    MarkAttendanceResponse.parse({
      id: record.id,
      userId: record.userId,
      userName: user?.name,
      timestamp: record.timestamp.toISOString(),
      status: record.status,
      date: record.date,
    }),
  );
});

export default router;
