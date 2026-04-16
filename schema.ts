import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  avatarUrl: text("avatarUrl"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Bookings table - stores travel booking records
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  /** Guest name for non-authenticated bookings */
  guestName: varchar("guestName", { length: 255 }),
  guestEmail: varchar("guestEmail", { length: 320 }),
  guestPhone: varchar("guestPhone", { length: 32 }),
  /** Package details */
  packageName: varchar("packageName", { length: 255 }).notNull(),
  packageCategory: varchar("packageCategory", { length: 100 }),
  destination: varchar("destination", { length: 255 }),
  /** Trip details */
  checkInDate: bigint("checkInDate", { mode: "number" }),
  checkOutDate: bigint("checkOutDate", { mode: "number" }),
  adults: int("adults").default(1),
  children: int("children").default(0),
  roomType: varchar("roomType", { length: 100 }),
  /** Pricing */
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  /** Payment */
  paymentMethod: mysqlEnum("paymentMethod", ["credit_card", "paypal", "bank_transfer"]),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  /** Promo code if applied */
  promoCode: varchar("promoCode", { length: 50 }),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }),
  /** Special requests */
  specialRequests: text("specialRequests"),
  /** Billing address as JSON */
  billingAddress: json("billingAddress"),
  /** Booking status */
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending").notNull(),
  /** Confirmation code */
  confirmationCode: varchar("confirmationCode", { length: 20 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Reviews table - stores user reviews and ratings
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  /** Guest info for non-authenticated reviews */
  guestName: varchar("guestName", { length: 255 }),
  guestAvatarUrl: text("guestAvatarUrl"),
  /** Review content */
  tripName: varchar("tripName", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }),
  rating: int("rating").notNull(),
  title: varchar("title", { length: 500 }),
  content: text("content").notNull(),
  /** Optional photo URLs as JSON array */
  photoUrls: json("photoUrls"),
  /** Travel date */
  travelDate: bigint("travelDate", { mode: "number" }),
  /** Admin reply */
  adminReply: text("adminReply"),
  adminReplyAt: timestamp("adminReplyAt"),
  /** Moderation */
  isApproved: mysqlEnum("isApproved", ["pending", "approved", "rejected"]).default("pending").notNull(),
  /** Helpful votes */
  helpfulCount: int("helpfulCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Offers table - stores promotional offers and discounts
 */
export const offers = mysqlTable("offers", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  /** Discount details */
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  /** Promo code */
  promoCode: varchar("promoCode", { length: 50 }).unique(),
  /** Validity */
  startDate: bigint("startDate", { mode: "number" }).notNull(),
  endDate: bigint("endDate", { mode: "number" }).notNull(),
  /** Offer metadata */
  category: varchar("category", { length: 100 }),
  destination: varchar("destination", { length: 255 }),
  imageUrl: text("imageUrl"),
  /** Availability */
  totalSpots: int("totalSpots"),
  bookedSpots: int("bookedSpots").default(0),
  /** Status */
  isActive: mysqlEnum("isActive", ["active", "inactive", "expired"]).default("active").notNull(),
  /** Badge text like "FLASH SALE", "EXCLUSIVE" */
  badgeText: varchar("badgeText", { length: 50 }),
  badgeColor: varchar("badgeColor", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

/**
 * Contact messages table - stores contact form submissions
 */
export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  subject: varchar("subject", { length: 500 }),
  message: text("message").notNull(),
  /** Status tracking */
  status: mysqlEnum("status", ["new", "read", "replied", "archived"]).default("new").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

/**
 * File uploads table - tracks uploaded files metadata (actual bytes in S3)
 */
export const fileUploads = mysqlTable("file_uploads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  /** S3 reference */
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  url: text("url").notNull(),
  /** File metadata */
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  /** Purpose: avatar, review_photo, document, etc. */
  purpose: varchar("purpose", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = typeof fileUploads.$inferInsert;
