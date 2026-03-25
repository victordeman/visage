import { pgTable, text, serial, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
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

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
