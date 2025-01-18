import { integer, pgTable, serial, timestamp, uuid } from "drizzle-orm/pg-core";
import user from "./user";
import role from "./role";
import { relations } from "drizzle-orm";

const userRole = pgTable("user_roles", {
  userId: integer("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  roleId: integer("role_id")
    .references(() => role.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const userRoleRelations = relations(userRole, ({ one }) => ({
  user: one(user, {
    fields: [userRole.userId],
    references: [user.id],
  }),
  role: one(role, {
    fields: [userRole.roleId],
    references: [role.id],
  }),
}));

export type UserRole = typeof userRole.$inferSelect;
export type NewUserRole = typeof userRole.$inferInsert;

export default userRole;
