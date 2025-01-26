import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import stores from "./store";
import { relations } from "drizzle-orm";

const products = pgTable("products", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  storeId: integer("store_id")
    .references(() => stores.id, {
      onDelete: "cascade",
    })
    .notNull()
    .unique(),
  name: varchar("name", { length: 255 }).notNull(),
  previewImage: varchar("preview_image", { length: 512 }),
  price: varchar("price", { length: 255 }),
  discount: varchar("discount", { length: 255 }),
  isActive: boolean().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const storesRelations = relations(products, ({ one }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export default products;
