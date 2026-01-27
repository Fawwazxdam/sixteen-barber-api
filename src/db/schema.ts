import { pgEnum } from "drizzle-orm/pg-core";
import { pgTable, serial, varchar, timestamp, integer, boolean, text, uuid } from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  price: integer("price").notNull(),
  duration: integer("duration").notNull(), // menit
  isActive: boolean("is_active").default(true),
});


export const roleEnum = pgEnum("role", ["ADMIN", "BARBER"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),

  barberId: uuid("barber_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),

  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "restrict" }),

  customerUserId: uuid("customer_user_id").references(() => users.id, {
    onDelete: "set null",
  }),

  customerName: varchar("customer_name", { length: 100 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull().default(""),
  customerNote: text("customer_note"),
  bookingDate: timestamp("booking_date", { withTimezone: true }).notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
});
