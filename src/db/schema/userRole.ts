import { integer, pgTable, serial, timestamp, uuid } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import users from "./user";
import roles from "./role";

const userRoles = pgTable("user_roles", {
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  roleId: integer("role_id")
    .references(() => roles.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;

export default userRoles;
