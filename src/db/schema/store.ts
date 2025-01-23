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
import { relations } from "drizzle-orm";
import users from "./user";

const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  storeName: varchar("store_name", { length: 255 }).notNull().unique(),
  storeUrlName: varchar("store_url_name", { length: 255 }).notNull().unique(),
  storeAddress: text("store_address"),
  storePhone: varchar("store_phone", { length: 20 }),

  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),

  profileImageUrl: varchar("profile_image_url", { length: 512 }),
  bannerImageUrl: varchar("banner_image_url", { length: 512 }),

  operatingHours: json("operating_hours").$type<
    {
      open: string;
      close: string;
      closed: boolean;
      day: string;
    }[]
  >(),

  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const storesRelations = relations(stores, ({ one }) => ({
  user: one(users, {
    fields: [stores.userId],
    references: [users.id],
  }),
}));

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;

export default stores;
