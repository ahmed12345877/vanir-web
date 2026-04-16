import { eq, desc, asc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  InsertBooking, bookings,
  InsertReview, reviews,
  InsertOffer, offers,
  InsertContactMessage, contactMessages,
  InsertFileUpload, fileUploads,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER HELPERS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ BOOKING HELPERS ============

export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(bookings).values(booking);
  const insertId = result[0].insertId;
  const rows = await db.select().from(bookings).where(eq(bookings.id, insertId)).limit(1);
  return rows[0];
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getBookingByConfirmationCode(code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(bookings).where(eq(bookings.confirmationCode, code)).limit(1);
  return result[0] ?? null;
}

export async function getUserBookings(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
}

export async function updateBookingStatus(id: number, status: "pending" | "confirmed" | "cancelled" | "completed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(bookings).set({ status }).where(eq(bookings.id, id));
  return getBookingById(id);
}

export async function updateBookingPaymentStatus(id: number, paymentStatus: "pending" | "paid" | "failed" | "refunded") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(bookings).set({ paymentStatus }).where(eq(bookings.id, id));
  return getBookingById(id);
}

export async function getAllBookings(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(limit).offset(offset);
}

// ============ REVIEW HELPERS ============

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reviews).values(review);
  const insertId = result[0].insertId;
  const rows = await db.select().from(reviews).where(eq(reviews.id, insertId)).limit(1);
  return rows[0];
}

export async function getApprovedReviews(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(reviews)
    .where(eq(reviews.isApproved, "approved"))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getAllReviews(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(reviews)
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getReviewById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  return result[0] ?? null;
}

export async function updateReviewApproval(id: number, isApproved: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(reviews).set({ isApproved }).where(eq(reviews.id, id));
  return getReviewById(id);
}

export async function addAdminReply(id: number, adminReply: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(reviews).set({ adminReply, adminReplyAt: new Date() }).where(eq(reviews.id, id));
  return getReviewById(id);
}

export async function incrementHelpfulCount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(reviews).set({ helpfulCount: sql`${reviews.helpfulCount} + 1` }).where(eq(reviews.id, id));
  return getReviewById(id);
}

export async function getReviewStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allApproved = await db.select().from(reviews).where(eq(reviews.isApproved, "approved"));
  const total = allApproved.length;
  if (total === 0) return { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

  const sum = allApproved.reduce((acc, r) => acc + r.rating, 0);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allApproved.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating as 1|2|3|4|5]++;
  });

  return { total, average: Math.round((sum / total) * 10) / 10, distribution };
}

// ============ OFFER HELPERS ============

export async function createOffer(offer: InsertOffer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(offers).values(offer);
  const insertId = result[0].insertId;
  const rows = await db.select().from(offers).where(eq(offers.id, insertId)).limit(1);
  return rows[0];
}

export async function getActiveOffers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = Date.now();
  return db.select().from(offers)
    .where(and(
      eq(offers.isActive, "active"),
      lte(offers.startDate, now),
      gte(offers.endDate, now),
    ))
    .orderBy(asc(offers.endDate));
}

export async function getAllOffers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(offers).orderBy(desc(offers.createdAt)).limit(limit).offset(offset);
}

export async function getOfferByPromoCode(promoCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(offers).where(eq(offers.promoCode, promoCode)).limit(1);
  return result[0] ?? null;
}

export async function updateOffer(id: number, data: Partial<InsertOffer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(offers).set(data).where(eq(offers.id, id));
  const rows = await db.select().from(offers).where(eq(offers.id, id)).limit(1);
  return rows[0];
}

// ============ CONTACT MESSAGE HELPERS ============

export async function createContactMessage(message: InsertContactMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(contactMessages).values(message);
  const insertId = result[0].insertId;
  const rows = await db.select().from(contactMessages).where(eq(contactMessages.id, insertId)).limit(1);
  return rows[0];
}

export async function getAllContactMessages(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(limit).offset(offset);
}

export async function updateContactMessageStatus(id: number, status: "new" | "read" | "replied" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
}

// ============ FILE UPLOAD HELPERS ============

export async function createFileUpload(file: InsertFileUpload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(fileUploads).values(file);
  const insertId = result[0].insertId;
  const rows = await db.select().from(fileUploads).where(eq(fileUploads.id, insertId)).limit(1);
  return rows[0];
}

export async function getUserFiles(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(fileUploads).where(eq(fileUploads.userId, userId)).orderBy(desc(fileUploads.createdAt));
}
