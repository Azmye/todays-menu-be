import { relations } from "drizzle-orm";
import { pgTable, serial, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import userRole from "./userRole";

const roles = pgTable("roles", {
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

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRole),
}));

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export default roles;
