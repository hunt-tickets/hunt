import {
  uuid,
  index,
  pgTable,
  unique,
  text,
  boolean,
  timestamp,
  jsonb,
  foreignKey,
  decimal,
  // varchar,
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
export const memberRole = pgEnum("member_role", [
  "seller",
  "administrator",
  "owner",
]);
export const themeModeType = pgEnum("theme_mode_type", [
  "light",
  "dark",
  "adaptive",
]);
export const ticketTriggerType = pgEnum("ticket_trigger_type", [
  "automatic",
  "manually",
]);
export const genderType = pgEnum("gender_type", [
  "masculino",
  "femenino",
  "otro",
  "prefiero_no_decir",
]);

// Countries table
export const countries = pgTable(
  "countries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    countryName: text("country_name").notNull(),
    countryCode: text("country_code"),
    currency: text("currency").notNull(),
  },
  (table) => [unique("countries_country_name_key").on(table.countryName)]
);

// Document Type table
export const documentType = pgTable(
  "document_type",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    countryId: uuid("country_id")
      .notNull()
      .references(() => countries.id),
    name: text("name").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.countryId],
      foreignColumns: [countries.id],
      name: "document_type_country_id_fkey",
    }),
  ]
);

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
    // New user profile fields
    documentId: text("document_id"),
    documentTypeId: uuid("document_type_id").references(() => documentType.id),
    gender: genderType("gender"),
    birthdate: timestamp("birthdate", { withTimezone: true }),
  },
  (table) => [
    unique("user_email_key").on(table.email),
    unique("user_phoneNumber_key").on(table.phoneNumber),
    foreignKey({
      columns: [table.documentTypeId],
      foreignColumns: [documentType.id],
      name: "user_document_type_id_fkey",
    }),
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
    activeOrganizationId: text(),
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
    createdAt: timestamp({ withTimezone: true }).default(
      sql`CURRENT_TIMESTAMP`
    ),
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

export const organization = pgTable(
  "organization",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    logo: text(),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    metadata: text(),
  },
  (table) => [unique("organization_slug_key").on(table.slug)]
);

export const member = pgTable(
  "member",
  {
    id: text().primaryKey().notNull(),
    organizationId: text().notNull(),
    userId: text().notNull(),
    role: memberRole("role").default("seller").notNull(),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: "member_organizationId_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "member_userId_fkey",
    }).onDelete("cascade"),
  ]
);

export const invitation = pgTable(
  "invitation",
  {
    id: text().primaryKey().notNull(),
    organizationId: text().notNull(),
    email: text().notNull(),
    role: memberRole("role").default("seller"),
    status: text().default("pending").notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    inviterId: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: "invitation_organizationId_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.inviterId],
      foreignColumns: [user.id],
      name: "invitation_inviterId_fkey",
    }).onDelete("cascade"),
  ]
);

// Payment processor account linking (OAuth-based)
export const paymentProcessorAccount = pgTable("payment_processor_account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  processorType: paymentProcessorType("processor_type").notNull(),
  processorAccountId: text("processor_account_id").notNull(), // e.g., Stripe Connect account ID
  accessToken: text("access_token").notNull(), // Encrypted OAuth access token
  refreshToken: text("refresh_token"), // Encrypted OAuth refresh token
  tokenExpiresAt: timestamp("token_expires_at"),
  scope: text("scope"), // OAuth scopes granted
  status: paymentProcessorStatus("status").notNull().default("inactive"),
  metadata: jsonb("metadata"), // Processor-specific metadata (account details, capabilities, etc.)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Hunt-Tickets specific tables

// Legacy Venues table - Archive of old venues with original schema
export const legacyVenues = pgTable(
  "legacy_venues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    address: text("address").notNull(),
    city: uuid("city"), // UUID reference to old cities table (no FK constraint)
    logo: text("logo"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    banner: text("banner"),
    link: text("link"),
    staticMapUrl: text("static_map_url"),
    googleName: text("google_name"),
    googleStreetNumber: text("google_street_number"),
    googleNeighborhood: text("google_neighborhood"),
    googleRoute: text("google_route"),
    googleSublocality: text("google_sublocality"),
    googleLocality: text("google_locality"),
    googleAreaLevel1: text("google_area_level_1"),
    googleAreaLevel2: text("google_area_level_2"),
    googlePostalCode: text("google_postal_code"),
    googleCountry: text("google_country"),
    googleCountryCode: text("google_country_code"),
    googleId: text("google_id"),
    googleMapsLink: text("google_maps_link"),
    timezoneId: text("timezone_id"),
    timezoneName: text("timezone_name"),
    utcOffset: decimal("utc_offset"),
    dtsOffset: decimal("dts_offset"),
    googleTotalReviews: text("google_total_reviews"),
    googleAvgRating: text("google_avg_rating"),
    googleWebsiteUrl: text("google_website_url"),
    googlePhoneNumber: text("google_phone_number"),
    currencyCode: text("currency_code"),
    wheelchairAccessible: boolean("wheelchair_accessible"),
    venueType: text("venue_type"),
    aiDescription: text("ai_description"),
    instagram: text("instagram"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_legacy_venues_name").on(table.name)]
);

// Legacy Events table - Archive of old events without organization link
export const legacyEvents = pgTable(
  "legacy_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    name: text("name"),
    description: text("description"),
    date: timestamp("date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    status: boolean("status").default(false),
    flyer: text("flyer"),
    venueId: uuid("venue_id"), // No foreign key for legacy data
    variableFee: decimal("variable_fee"),
    fixedFee: decimal("fixed_fee"),
    age: decimal("age"),
    cash: boolean("cash").notNull().default(false),
    extraInfo: text("extra_info"),
    ics: text("ics"),
    flyerApple: text("flyer_apple"),
    flyerGoogle: text("flyer_google"),
    flyerOverlay: text("flyer_overlay"),
    flyerBackground: text("flyer_background"),
    flyerBanner: text("flyer_banner"),
    posFee: decimal("pos_fee"),
    hex: text("hex"),
    priority: boolean("priority").notNull().default(false),
    hexText: text("hex_text"),
    guestList: boolean("guest_list").notNull().default(false),
    privateList: boolean("private_list").notNull().default(false),
    accessPass: boolean("access_pass").notNull().default(false),
    guestListMaxHour: timestamp("guest_list_max_hour", { withTimezone: true }),
    guestListQuantity: decimal("guest_list_quantity"),
    guestListInfo: text("guest_list_info"),
    hexTextSecondary: text("hex_text_secondary").notNull().default("A3A3A3"),
    lateFee: decimal("late_fee"),
    guestEmail: text("guest_email"),
    guestName: text("guest_name"),
    faqs: jsonb("faqs").$type<Array<Record<string, unknown>>>(),
  },
  (table) => [
    // Indexes for query performance
    index("idx_legacy_events_date").on(table.date),
    index("idx_legacy_events_end_date").on(table.endDate),
    index("idx_legacy_events_status_end_date").on(table.status, table.endDate),
    // Foreign keys
    foreignKey({
      columns: [table.venueId],
      foreignColumns: [legacyVenues.id],
      name: "legacy_events_legacy_venuId_fkey",
    }).onDelete("cascade"),
  ]
);

// Venues table
export const venues = pgTable(
  "venues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    address: text("address"),
    city: text("city"),
    country: text("country"),
    postalCode: text("postal_code"),
    state: text("state"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    logo: text("logo"),
    banner: text("banner"),
    link: text("link"),
    staticMapUrl: text("static_map_url"),
    // Google Places integration
    googleId: text("google_id"),
    googleName: text("google_name"),
    googleMapsLink: text("google_maps_link"),
    googleLocality: text("google_locality"),
    googleAreaLevel1: text("google_area_level_1"),
    googlePostalCode: text("google_postal_code"),
    googleCountry: text("google_country"),
    googleCountryCode: text("google_country_code"),
    googlePhoneNumber: text("google_phone_number"),
    googleWebsiteUrl: text("google_website_url"),
    googleAvgRating: text("google_avg_rating"),
    googleTotalReviews: text("google_total_reviews"),
    // Timezone information
    timezoneId: text("timezone_id"),
    timezoneName: text("timezone_name"),
    utcOffset: decimal("utc_offset"),
    dtsOffset: decimal("dts_offset"),
    // Additional metadata
    currencyCode: text("currency_code"),
    wheelchairAccessible: boolean("wheelchair_accessible"),
    venueType: text("venue_type"),
    aiDescription: text("ai_description"),
    instagram: text("instagram"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("idx_venues_name").on(table.name)]
);

// Events table - NEW events linked to organizations
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    name: text("name"),
    description: text("description"),
    date: timestamp("date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    status: boolean("status").default(false),
    city: text("city"),
    country: text("country"),
    flyer: text("flyer"),
    venueId: uuid("venue_id").references(() => venues.id),
    variableFee: decimal("variable_fee"),
    fixedFee: decimal("fixed_fee"),
    age: decimal("age"),
    cash: boolean("cash").notNull().default(false),
    extraInfo: text("extra_info"),
    ics: text("ics"),
    flyerApple: text("flyer_apple"),
    flyerGoogle: text("flyer_google"),
    flyerOverlay: text("flyer_overlay"),
    flyerBackground: text("flyer_background"),
    flyerBanner: text("flyer_banner"),
    posFee: decimal("pos_fee"),

    hex: text("hex"),
    priority: boolean("priority").notNull().default(false),
    hexText: text("hex_text"),
    guestList: boolean("guest_list").notNull().default(false),
    privateList: boolean("private_list").notNull().default(false),
    accessPass: boolean("access_pass").notNull().default(false),
    guestListMaxHour: timestamp("guest_list_max_hour", { withTimezone: true }),
    guestListQuantity: decimal("guest_list_quantity"),
    guestListInfo: text("guest_list_info"),
    hexTextSecondary: text("hex_text_secondary").notNull().default("A3A3A3"),
    lateFee: decimal("late_fee"),
    guestEmail: text("guest_email"),
    guestName: text("guest_name"),
    faqs: jsonb("faqs").$type<Array<Record<string, unknown>>>(),
  },
  (table) => [
    // Indexes for query performance (matching your original schema)
    index("idx_events_organization_id").on(table.organizationId),
    index("idx_events_date").on(table.date),
    index("idx_events_end_date").on(table.endDate),
    index("idx_events_status_end_date").on(table.status, table.endDate),
    index("idx_events_date_range").on(table.date, table.endDate),
    // Composite index for common query: "show active events for this organization"
    index("idx_events_org_status_date").on(
      table.organizationId,
      table.status,
      table.date
    ),
  ]
);

// Export schema object for Drizzle
export const schema = {
  user,
  session,
  account,
  verification,
  passkey,
  organization,
  member,
  invitation,
  paymentProcessorAccount,
  countries,
  documentType,
  legacyVenues,
  venues,
  legacyEvents,
  events,
};
