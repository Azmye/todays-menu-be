import { relations } from "drizzle-orm";
import { pgTable, serial, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import userRole from "./userRole";

const role = pgTable("roles", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const roleRelations = relations(role, ({ many }) => ({
  userRoles: many(userRole),
}));

export type Role = typeof role.$inferSelect;
export type NewRole = typeof role.$inferInsert;

export default role;
