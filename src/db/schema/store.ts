import {
  boolean,
  decimal,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import user from "./user";
import { relations } from "drizzle-orm";

const store = pgTable("stores", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  userId: integer("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull()
    .unique(),

  storeName: varchar("store_name", { length: 255 }).notNull(),
  storeAddress: text("store_address"),
  storePhone: varchar("store_phone", { length: 20 }),

  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),

  profileImageUrl: varchar("profile_image_url", { length: 512 }),
  bannerImageUrl: varchar("banner_image_url", { length: 512 }),

  operatingHours: json("operating_hours").$type<{
    [key: string]: { open: string; close: string; closed: boolean };
  }>(),

  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const storeRelations = relations(store, ({ one }) => ({
  user: one(user, {
    fields: [store.id],
    references: [user.id],
  }),
}));

export type Store = typeof store.$inferSelect;
export type NewStore = typeof store.$inferInsert;

export default store;
