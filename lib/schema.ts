import {
  pgTable,
  unique,
  text,
  boolean,
  timestamp,
  jsonb,
  foreignKey,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const accountTypeEnum = pgEnum("account_type_enum", [
  "savings",
  "checking",
  "business",
  "other",
]);
export const adjustmentType = pgEnum("adjustment_type", [
  "debit",
  "credit",
  "refund",
  "fee",
  "penalty",
  "bonus",
]);
export const discountCodeType = pgEnum("discount_code_type", [
  "percentage",
  "fixed_amount",
]);
export const discountType = pgEnum("discount_type", [
  "percentage",
  "fixed_amount",
  "free",
]);
export const documentTypeEnum = pgEnum("document_type_enum", [
  "CC",
  "CE",
  "DNI",
  "RUT",
  "RFC",
  "CPF",
  "PASSPORT",
  "OTHER",
]);
export const eventLanguage = pgEnum("event_language", [
  "en",
  "es",
  "fr",
  "pt",
  "it",
  "de",
]);
export const eventStatus = pgEnum("event_status", [
  "draft",
  "published",
  "cancelled",
  "completed",
]);
export const eventStatusType = pgEnum("event_status_type", [
  "draft",
  "active",
  "inactive",
  "sold_out",
  "cancelled",
]);
export const feePaymentType = pgEnum("fee_payment_type", [
  "absorver_fees",
  "dividir_fee",
  "pasar_fees",
]);
export const frequencyType = pgEnum("frequency_type", ["single", "recurring"]);
export const languageType = pgEnum("language_type", ["es", "en", "pt", "fr"]);
export const paymentProcessorStatus = pgEnum("payment_processor_status", [
  "active",
  "inactive",
  "suspended",
]);
export const paymentProcessorType = pgEnum("payment_processor_type", [
  "stripe",
  "mercadopago",
]);
export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
  "refunded",
]);
export const privacyType = pgEnum("privacy_type", ["public", "private"]);
export const refundStatus = pgEnum("refund_status", [
  "pending",
  "accepted",
  "rejected",
]);
export const role = pgEnum("role", ["seller", "admin", "owner"]);
export const themeModeType = pgEnum("theme_mode_type", [
  "light",
  "dark",
  "adaptive",
]);
export const ticketTriggerType = pgEnum("ticket_trigger_type", [
  "automatic",
  "manually",
]);

export const user = pgTable(
  "user",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean().notNull(),
    image: text(),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    role: text(),
    banned: boolean(),
    banReason: text(),
    banExpires: timestamp({ withTimezone: true }),
    isAnonymous: boolean(),
    phoneNumber: text(),
    phoneNumberVerified: boolean(),
    userMetadata: jsonb(),
    appMetadata: jsonb(),
    invitedAt: timestamp({ withTimezone: true }),
    lastSignInAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    unique("user_email_key").on(table.email),
    unique("user_phoneNumber_key").on(table.phoneNumber),
  ]
);

export const session = pgTable(
  "session",
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: text().notNull(),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: text().notNull(),
    impersonatedBy: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_userId_fkey",
    }).onDelete("cascade"),
    unique("session_token_key").on(table.token),
  ]
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey().notNull(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text().notNull(),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_userId_fkey",
    }).onDelete("cascade"),
  ]
);

export const verification = pgTable("verification", {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const passkey = pgTable(
  "passkey",
  {
    id: text().primaryKey().notNull(),
    name: text(),
    publicKey: text().notNull(),
    userId: text().notNull(),
    credentialID: text().notNull(),
    counter: integer().notNull(),
    deviceType: text().notNull(),
    backedUp: boolean().notNull(),
    transports: text(),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    aaguid: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "passkey_userId_fkey",
    }).onDelete("cascade"),
    unique("passkey_credentialID_key").on(table.credentialID),
  ]
);

export const paymentProcessorAccount = pgTable("payment_processor_account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  processorType: paymentProcessorType("processor_type").notNull(),
  processorAccountId: text("processor_account_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  scope: text("scope"),
  status: paymentProcessorStatus("status").notNull().default("active"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Export schema object for Drizzle
export const schema = {
  user,
  session,
  account,
  verification,
  passkey,
  paymentProcessorAccount,
};
