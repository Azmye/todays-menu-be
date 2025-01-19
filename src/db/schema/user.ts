import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  pgTable,
  serial,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import stores from "./store";
import userRoles from "./userRole";

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),

  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull(),

  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phoneNumber: varchar("phone_number", { length: 20 }),

  profilePhotoUrl: varchar("profile_photo_url", { length: 512 }),

  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 50 }),

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastLogin: timestamp("last_login", { withTimezone: true }),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  userRoles: many(userRoles),
  store: one(stores, {
    fields: [users.id],
    references: [stores.userId],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export default users;
