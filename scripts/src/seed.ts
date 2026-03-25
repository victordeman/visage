import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import bcrypt from "bcryptjs";
import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Define table inline to avoid workspace import issues
const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  department: text("department"),
  jobDesignation: text("job_designation"),
  homeAddress: text("home_address"),
  dob: text("dob"),
  imagePath: text("image_path"),
  faceDescriptor: text("face_descriptor"),
  hasEmbedding: boolean("has_embedding").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const db = drizzle(pool, { schema: { usersTable } });

async function seed() {
  const [existingVictor] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, "victor"));

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
    console.log("Seeded Victor (admin)");
  } else {
    console.log("Victor already exists");
  }

  const [existingMark] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, "mark"));

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
    console.log("Seeded Mark (student)");
  } else {
    console.log("Mark already exists");
  }

  await pool.end();
  console.log("Seeding complete!");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
