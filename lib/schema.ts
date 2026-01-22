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
  pgEnum,
  integer,
  // varchar,
} from "drizzle-orm/pg-core";
import { sql, type InferSelectModel, type InferInsertModel } from "drizzle-orm";

// Ticketing process:
//   1. User completes checkout → Create reservation
//   2. Payment webhook (Stripe/Mercado Pago) →
//   3. Backend: Convert reservation to order + tickets (atomic)
//   4. Backend: Call Edge Function or send emails directly
//   5. INSERT into email_logs table
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
export const orderFrom = pgEnum("order_from", ["cash", "web", "app"]);
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
// Core ticketing system enums
export const reservationStatus = pgEnum("reservation_status", [
  "active",
  "expired",
  "converted",
  "cancelled",
]);
export const orderPaymentStatus = pgEnum("order_payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
  "refund_failed",
]);
export const ticketStatus = pgEnum("ticket_status", [
  "valid",
  "used",
  "cancelled",
  "transferred",
]);
export const eventLifecycleStatus = pgEnum("event_lifecycle_status", [
  "active",
  "cancelled",
  "cancellation_pending",
  "archived",
]);
export const eventCategory = pgEnum("event_category", [
  "fiestas",
  "conciertos",
  "festivales",
  "bienestar",
  "clases",
  "ferias",
  "deportes",
  "teatro",
]);
export const eventType = pgEnum("event_type", [
  "single",
  "multi_day",
  "recurring",
  "slots",
]);

/**
 * ->>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * ->>>>>>>>>>>>>>>>>>>>>>>>>>>>
 */

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

/**
 * Auth
 */
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
    // New fields from database
    tipoPersona: text("tipo_persona").default("natural"),
    nombres: text("nombres"),
    apellidos: text("apellidos"),
    razonSocial: text("razon_social"),
    nit: text("nit"),
  },
  (table) => [
    // The UNIQUE constraint ensures that all values in a column are different.
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

/**
 * Organization
 */
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
    // New fields from database
    tipoOrganizacion: text("tipo_organizacion"),
    nombres: text("nombres"),
    apellidos: text("apellidos"),
    tipoDocumento: text("tipo_documento"),
    numeroDocumento: text("numero_documento"),
    nit: text("nit"),
    direccion: text("direccion"),
    numeroTelefono: text("numero_telefono"),
    correoElectronico: text("correo_electronico"),
    rutUrl: text("rut_url"),
    cerlUrl: text("cerl_url"),
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
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
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
  organizationId: text("organization_id").references(() => organization.id, {
    onDelete: "cascade",
  }),
  processorType: paymentProcessorType("processor_type").notNull(),
  processorAccountId: text("processor_account_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  scope: text("scope"),
  status: paymentProcessorStatus("status").notNull().default("inactive"),
  metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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

/**
 * Events
 */
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
    category: eventCategory("category"),
    type: eventType("type").default("single"),
    // recurrence: jsonb("recurrence").$type<{
    //   pattern: "daily" | "weekly" | "biweekly" | "monthly";
    //   daysOfWeek?: number[];
    //   time: string;
    //   endTime?: string;
    //   until?: string;
    //   count?: number;
    // }>(),
    name: text("name"),
    description: text("description"),
    date: timestamp("date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    status: boolean("status").default(false),
    city: text("city"),
    country: text("country"),
    address: text("address"),
    venueId: uuid("venue_id").references(() => venues.id),
    venueName: text("venue_name"),
    variableFee: decimal("variable_fee"),
    fixedFee: decimal("fixed_fee"),
    minAge: decimal("age"),
    cash: boolean("cash").notNull().default(false),
    extraInfo: text("extra_info"),
    ics: text("ics"),
    flyer: text("flyer"),
    // flyerApple: text("flyer_apple"),
    // flyerGoogle: text("flyer_google"),
    // flyerOverlay: text("flyer_overlay"),
    // flyerBackground: text("flyer_background"),
    // flyerBanner: text("flyer_banner"),
    // posFee: decimal("pos_fee"),
    // hex: text("hex"),
    // priority: boolean("priority").notNull().default(false),
    // hexText: text("hex_text"),
    // guestList: boolean("guest_list").notNull().default(false),
    // privateList: boolean("private_list").notNull().default(false),
    // accessPass: boolean("access_pass").notNull().default(false),
    // guestListMaxHour: timestamp("guest_list_max_hour", { withTimezone: true }),
    // guestListQuantity: decimal("guest_list_quantity"),
    // guestListInfo: text("guest_list_info"),
    // hexTextSecondary: text("hex_text_secondary").notNull().default("A3A3A3"),
    // lateFee: decimal("late_fee"),
    // guestEmail: text("guest_email"),
    // guestName: text("guest_name"),
    faqs: jsonb("faqs").$type<Array<Record<string, unknown>>>(),
    checkout_questions: jsonb("checkout_questions").$type<
      Array<{
        id: string;
        question: string;
        type: "text" | "select" | "multiselect" | "textarea";
        required: boolean;
        scope: "per_order" | "per_ticket";
        ticket_type_ids: string[];
        options: string[];
        placeholder: string;
        sort_order: number;
      }>
    >(),
    // lifecycle management
    lifecycleStatus: eventLifecycleStatus("lifecycle_status")
      .default("active")
      .notNull(),
      
    // Cancellation workflow fields
    cancellationReason: text("cancellation_reason"),
    cancelledBy: text("cancelled_by").references(() => user.id, {
      onDelete: "set null",
    }), // Who initiated the cancellation
    cancellationInitiatedAt: timestamp("cancellation_initiated_at", {
      withTimezone: true,
    }), // When admin clicked "Cancel Event" button
    cancellationCompletedAt: timestamp("cancellation_completed_at", {
      withTimezone: true,
    }), // When all refunds finished processing (lifecycle → 'cancelled')
    deletedAt: timestamp("deleted_at", { withTimezone: true }), // Soft delete: set when lifecycle_status = 'cancelled'
    modificationLocked: boolean("modification_locked").default(false),
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
    // Indexes for lifecycle management
    index("idx_events_lifecycle_status").on(table.lifecycleStatus),
    index("idx_events_cancellation_initiated").on(
      table.cancellationInitiatedAt
    ),
    index("idx_events_deleted").on(table.deletedAt),
  ]
);

// Event Days (for multi-day events like festivals)
export const eventDays = pgTable(
  "event_days",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }), // CRITICAL: Prevent deletion if event days exist
    date: timestamp("date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    name: text("name"), // "Pre-Party", "Día 1", "Viernes"
    sortOrder: integer("sort_order").default(0),
    // NEW: Festival essentials
    description: text("description"), // Lineup, what's happening
    flyer: text("flyer"), // Day-specific artwork
    doorsOpen: timestamp("doors_open", { withTimezone: true }),
    showStart: timestamp("show_start", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_event_days_event").on(table.eventId)]
);

// Ticket Types (palcos, VIP, general, etc.)
export const ticketTypes = pgTable(
  "ticket_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }), // CRITICAL: Prevent deletion if ticket types exist
    eventDayId: uuid("event_day_id").references(() => eventDays.id, {
      onDelete: "set null",
    }), // null = all days
    name: text("name").notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    capacity: integer("capacity").notNull(),
    soldCount: integer("sold_count").notNull().default(0),
    reservedCount: integer("reserved_count").notNull().default(0),
    minPerOrder: integer("min_per_order").notNull().default(1),
    maxPerOrder: integer("max_per_order").notNull().default(10),
    saleStart: timestamp("sale_start", { withTimezone: true }),
    saleEnd: timestamp("sale_end", { withTimezone: true }),
    isAddon: boolean("is_addon").notNull().default(false), // true = requires base ticket
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    active: boolean("active").notNull().default(false),
  },
  (table) => [
    index("idx_ticket_types_event").on(table.eventId),
    // Note: The CHECK constraint (sold_count + reserved_count <= capacity)
    // will be added in the migration SQL
  ]
);

// The reservations table acts like a shopping cart hold:
//  The reservations table acts like a shopping cart hold:

//   1. User A clicks "Buy 5" → Immediately reserves 5 tickets (atomic operation with row lock)
//     - reserved_count increases by 5
//     - 10-minute timer starts
//   2. User B clicks "Buy 8" → System checks: capacity - sold_count - reserved_count = 10 - 0 - 5 = 5 available
//     - Instant error: "Only 5 tickets left"
//     - User B doesn't waste time entering payment info
//   3. User A completes payment within 10 min → Reservation converts to real tickets
//     - reserved_count decreases by 5
//     - sold_count increases by 5
//   4. User A abandons cart → After 10 min, background job expires reservation
//     - reserved_count decreases by 5
//     - Tickets become available again for others

//   Key Benefits

//   1. Prevents overselling - Atomic locks ensure accuracy
//   2. Better UX - Immediate feedback on availability
//   3. Fair - First to reserve gets priority
//   4. Recovers abandoned carts - Auto-expires and releases tickets
//   5. High concurrency - Handles hundreds of simultaneous buyers safely
export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }), // CRITICAL: Prevent deletion if reservations exist
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    status: reservationStatus("status").notNull().default("active"),
    // Payment session tracking
    paymentSessionId: text("payment_session_id").unique(), // Mercado Pago Preference ID or Stripe Checkout Session
    paymentProcessor: text("payment_processor"), // 'mercadopago' or 'stripe'
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_reservations_user").on(table.userId),
    index("idx_reservations_event").on(table.eventId),
    index("idx_reservations_expires").on(table.expiresAt),
    index("idx_reservations_payment_session").on(table.paymentSessionId),
  ]
);

// Reservation items (multiple ticket types per reservation)
export const reservationItems = pgTable(
  "reservation_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reservationId: uuid("reservation_id")
      .notNull()
      .references(() => reservations.id, { onDelete: "cascade" }),
    ticketTypeId: uuid("ticket_type_id")
      .notNull()
      .references(() => ticketTypes.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_reservation_items_reservation").on(table.reservationId),
    index("idx_reservation_items_ticket_type").on(table.ticketTypeId),
  ]
);

// Orders (purchases)
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }), // CRITICAL: Prevent deletion if orders exist - users would lose money!
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("COP"),
    marketplaceFee: decimal("marketplace_fee", { precision: 10, scale: 2 }), // Hunt's fee
    processorFee: decimal("processor_fee", { precision: 10, scale: 2 }), // Mercado Pago's fee
    taxWithholdingIca: decimal("tax_withholding_ica", { precision: 10, scale: 2 }), // Colombian ICA tax withholding
    taxWithholdingFuente: decimal("tax_withholding_fuente", { precision: 10, scale: 2 }), // Colombian Retención en la Fuente
    paymentStatus: orderPaymentStatus("payment_status")
      .notNull()
      .default("pending"),
    platform: orderFrom("platform").notNull().default("cash"), // 'web' | 'app' | 'cash'
    paymentSessionId: text("payment_session_id"), // Stripe/Mercado Pago session ID
    soldBy: text("sold_by").references(() => user.id, { onDelete: "set null" }), // For cash sales: the seller who made the sale
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_orders_user").on(table.userId),
    index("idx_orders_event").on(table.eventId),
    index("idx_orders_payment_status").on(table.paymentStatus),
    index("idx_orders_sold_by").on(table.soldBy),
  ]
);

// Order items (line items for each ticket type in the order)
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    ticketTypeId: uuid("ticket_type_id")
      .notNull()
      .references(() => ticketTypes.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    pricePerTicket: decimal("price_per_ticket", {
      precision: 10,
      scale: 2,
    }).notNull(), // Price snapshot
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_order_items_order").on(table.orderId),
    index("idx_order_items_ticket_type").on(table.ticketTypeId),
  ]
);

// Refunds (order refund)
export const refund = pgTable("refunds", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
    
});

// Tickets (actual tickets issued)
export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    reservationId: uuid("reservation_id").references(() => reservations.id), // Audit trail
    ticketTypeId: uuid("ticket_type_id")
      .notNull()
      .references(() => ticketTypes.id, { onDelete: "cascade" }),
    eventDayId: uuid("event_day_id").references(() => eventDays.id, {
      onDelete: "set null",
    }), // which day this ticket is for
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    qrCode: text("qr_code").notNull().unique(),
    platform: orderFrom("platform").notNull().default("cash"), // 'web' | 'app' | 'cash'
    status: ticketStatus("status").notNull().default("valid"),
    scannedAt: timestamp("scanned_at", { withTimezone: true }),
    scannedBy: text("scanned_by").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_tickets_order").on(table.orderId),
    index("idx_tickets_reservation").on(table.reservationId),
    index("idx_tickets_ticket_type").on(table.ticketTypeId),
    index("idx_tickets_user").on(table.userId),
    index("idx_tickets_qr_code").on(table.qrCode),
  ]
);

// Refunds table (audit trail and workflow for refund processing)
export const refunds = pgTable(
  "refunds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Amount to refund
    currency: text("currency").notNull().default("COP"),
    reason: text("reason").notNull(), // 'event_cancelled', 'customer_request', etc
    // Workflow timestamps
    requestedAt: timestamp("requested_at", { withTimezone: true })
      .defaultNow()
      .notNull(), // When refund was created (event cancelled)
    requestedBy: text("requested_by").references(() => user.id, {
      onDelete: "set null",
    }), // Who initiated the cancellation
    approvedAt: timestamp("approved_at", { withTimezone: true }), // When admin approved
    approvedBy: text("approved_by").references(() => user.id, {
      onDelete: "set null",
    }), // Who approved the refund
    processedAt: timestamp("processed_at", { withTimezone: true }), // When MP API call succeeded
    // Mercado Pago integration
    mpRefundId: text("mp_refund_id"), // Mercado Pago refund ID
    mpPaymentId: text("mp_payment_id"), // Original payment ID from order
    // Status tracking
    status: text("status").notNull().default("pending"), // 'pending', 'approved', 'processing', 'completed', 'failed'
    failureReason: text("failure_reason"), // If status = 'failed'
    metadata: jsonb("metadata"), // Additional context (retry attempts, etc)
  },
  (table) => [
    index("idx_refunds_order").on(table.orderId),
    index("idx_refunds_event").on(table.eventId),
    index("idx_refunds_status").on(table.status),
    index("idx_refunds_requested_at").on(table.requestedAt),
  ]
);

// Event audit log (track all administrative actions on events)
export const eventAuditLog = pgTable(
  "event_audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    action: text("action").notNull(), // 'cancelled', 'archived', 'modified', 'created', 'published'
    performedBy: text("performed_by")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    reason: text("reason"), // Cancellation reason, modification reason, etc
    metadata: jsonb("metadata"), // Additional context (what fields changed, impact stats, etc)
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_event_audit_log_event").on(table.eventId),
    index("idx_event_audit_log_action").on(table.action),
    index("idx_event_audit_log_created_at").on(table.createdAt),
  ]
);

// Email logs (audit trail for all emails sent)
export const emailLogs = pgTable(
  "email_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "cascade",
    }), // Optional - not all emails are order-related
    eventId: uuid("event_id").references(() => events.id, {
      onDelete: "cascade",
    }), // For event cancellation/modification notifications
    emailType: text("email_type").notNull(), // 'purchase_confirmation', 'ticket_delivery', 'refund', 'event_cancelled', 'event_modified', etc
    recipientEmail: text("recipient_email").notNull(),
    emailServiceId: text("email_service_id"), // Resend ID
    status: text("status").notNull().default("sent"), // 'sent', 'failed', 'bounced', 'delivered'
    metadata: jsonb("metadata"), // Additional data (PDF URL, QR URLs, cancellation details, etc)
    sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_email_logs_order").on(table.orderId),
    index("idx_email_logs_event").on(table.eventId),
    index("idx_email_logs_recipient").on(table.recipientEmail),
    index("idx_email_logs_service_id").on(table.emailServiceId),
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
  eventDays,
  ticketTypes,
  reservations,
  reservationItems,
  orders,
  orderItems,
  tickets,
  refunds,
  eventAuditLog,
  emailLogs,
};

// Inferred types from Drizzle schema
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;
export type Event = InferSelectModel<typeof events>;
export type NewEvent = InferInsertModel<typeof events>;
export type Venue = InferSelectModel<typeof venues>;
export type NewVenue = InferInsertModel<typeof venues>;
export type TicketType = InferSelectModel<typeof ticketTypes>;
export type NewTicketType = InferInsertModel<typeof ticketTypes>;
export type Order = InferSelectModel<typeof orders>;
export type NewOrder = InferInsertModel<typeof orders>;
export type Ticket = InferSelectModel<typeof tickets>;
export type NewTicket = InferInsertModel<typeof tickets>;
export type Reservation = InferSelectModel<typeof reservations>;
export type NewReservation = InferInsertModel<typeof reservations>;
export type OrderItem = InferSelectModel<typeof orderItems>;
export type NewOrderItem = InferInsertModel<typeof orderItems>;
export type ReservationItem = InferSelectModel<typeof reservationItems>;
export type NewReservationItem = InferInsertModel<typeof reservationItems>;
export type Organization = InferSelectModel<typeof organization>;
export type NewOrganization = InferInsertModel<typeof organization>;
export type Member = InferSelectModel<typeof member>;
export type NewMember = InferInsertModel<typeof member>;
export type EmailLog = InferSelectModel<typeof emailLogs>;
export type NewEmailLog = InferInsertModel<typeof emailLogs>;
export type EventAuditLog = InferSelectModel<typeof eventAuditLog>;
export type NewEventAuditLog = InferInsertModel<typeof eventAuditLog>;
export type Refund = InferSelectModel<typeof refunds>;
export type NewRefund = InferInsertModel<typeof refunds>;
export type Invitation = InferSelectModel<typeof invitation>;
export type NewInvitation = InferInsertModel<typeof invitation>;
export type PaymentProcessorAccount = InferSelectModel<
  typeof paymentProcessorAccount
>;
export type NewPaymentProcessorAccount = InferInsertModel<
  typeof paymentProcessorAccount
>;
export type PaymentProcessorType =
  (typeof paymentProcessorType.enumValues)[number];
export type PaymentProcessorStatus =
  (typeof paymentProcessorStatus.enumValues)[number];

// MercadoPago OAuth metadata shape
export interface MercadoPagoMetadata {
  email: string;
  user_id: string;
  nickname: string;
  last_name: string;
  live_mode: boolean;
  country_id: string;
  first_name: string;
  public_key: string;
}

// Organization data as returned by Better Auth API (optional fields can be undefined)
export interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date;
  metadata?: string | null;
  tipoOrganizacion?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  nit?: string | null;
  direccion?: string | null;
  numeroTelefono?: string | null;
  correoElectronico?: string | null;
  rutUrl?: string | null;
  cerlUrl?: string | null;
  paymentProcessorAccount?: PaymentProcessorAccount[];
}

// Keep backward compatibility
export type orderItem = OrderItem;
export type EventDay = InferSelectModel<typeof eventDays>;
export type NewEventDay = InferInsertModel<typeof eventDays>;
