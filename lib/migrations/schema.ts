import { pgTable, foreignKey, unique, text, timestamp, integer, boolean, jsonb, index, uuid, numeric, check, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const accountTypeEnum = pgEnum("account_type_enum", ['savings', 'checking', 'business', 'other'])
export const adjustmentType = pgEnum("adjustment_type", ['debit', 'credit', 'refund', 'fee', 'penalty', 'bonus'])
export const discountCodeType = pgEnum("discount_code_type", ['percentage', 'fixed_amount'])
export const discountType = pgEnum("discount_type", ['percentage', 'fixed_amount', 'free'])
export const documentTypeEnum = pgEnum("document_type_enum", ['CC', 'CE', 'DNI', 'RUT', 'RFC', 'CPF', 'PASSPORT', 'OTHER'])
export const eventLanguage = pgEnum("event_language", ['en', 'es', 'fr', 'pt', 'it', 'de'])
export const eventStatus = pgEnum("event_status", ['draft', 'published', 'cancelled', 'completed'])
export const eventStatusType = pgEnum("event_status_type", ['draft', 'active', 'inactive', 'sold_out', 'cancelled'])
export const feePaymentType = pgEnum("fee_payment_type", ['absorver_fees', 'dividir_fee', 'pasar_fees'])
export const frequencyType = pgEnum("frequency_type", ['single', 'recurring'])
export const genderType = pgEnum("gender_type", ['masculino', 'femenino', 'otro', 'prefiero_no_decir'])
export const languageType = pgEnum("language_type", ['es', 'en', 'pt', 'fr'])
export const memberRole = pgEnum("member_role", ['seller', 'administrator', 'owner'])
export const orderFrom = pgEnum("order_from", ['cash', 'web', 'app'])
export const orderPaymentStatus = pgEnum("order_payment_status", ['pending', 'paid', 'failed', 'refunded'])
export const paymentProcessorStatus = pgEnum("payment_processor_status", ['active', 'inactive', 'suspended'])
export const paymentProcessorType = pgEnum("payment_processor_type", ['stripe', 'mercadopago'])
export const paymentStatus = pgEnum("payment_status", ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'])
export const privacyType = pgEnum("privacy_type", ['public', 'private'])
export const refundStatus = pgEnum("refund_status", ['pending', 'accepted', 'rejected'])
export const reservationStatus = pgEnum("reservation_status", ['active', 'expired', 'converted', 'cancelled'])
export const themeModeType = pgEnum("theme_mode_type", ['light', 'dark', 'adaptive'])
export const ticketStatus = pgEnum("ticket_status", ['valid', 'used', 'cancelled', 'transferred'])
export const ticketTriggerType = pgEnum("ticket_trigger_type", ['automatic', 'manually'])


export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
	impersonatedBy: text(),
	activeOrganizationId: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_fkey"
		}).onDelete("cascade"),
	unique("session_token_key").on(table.token),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ withTimezone: true, mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ withTimezone: true, mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_fkey"
		}).onDelete("cascade"),
]);

export const passkey = pgTable("passkey", {
	id: text().primaryKey().notNull(),
	name: text(),
	publicKey: text().notNull(),
	userId: text().notNull(),
	credentialId: text().notNull(),
	counter: integer().notNull(),
	deviceType: text().notNull(),
	backedUp: boolean().notNull(),
	transports: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	aaguid: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "passkey_userId_fkey"
		}).onDelete("cascade"),
	unique("passkey_credentialID_key").on(table.credentialId),
]);

export const paymentProcessorAccount = pgTable("payment_processor_account", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	processorType: paymentProcessorType("processor_type").notNull(),
	processorAccountId: text("processor_account_id").notNull(),
	accessToken: text("access_token").notNull(),
	refreshToken: text("refresh_token"),
	tokenExpiresAt: timestamp("token_expires_at", { mode: 'string' }),
	scope: text(),
	status: paymentProcessorStatus().default('inactive').notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	organizationId: text("organization_id"),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "payment_processor_account_organization_id_organization_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "payment_processor_account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const legacyVenues = pgTable("legacy_venues", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	address: text().notNull(),
	city: uuid(),
	logo: text(),
	latitude: text(),
	longitude: text(),
	banner: text(),
	link: text(),
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
	utcOffset: numeric("utc_offset"),
	dtsOffset: numeric("dts_offset"),
	googleTotalReviews: text("google_total_reviews"),
	googleAvgRating: text("google_avg_rating"),
	googleWebsiteUrl: text("google_website_url"),
	googlePhoneNumber: text("google_phone_number"),
	currencyCode: text("currency_code"),
	wheelchairAccessible: boolean("wheelchair_accessible"),
	venueType: text("venue_type"),
	aiDescription: text("ai_description"),
	instagram: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_legacy_venues_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const countries = pgTable("countries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	countryName: text("country_name").notNull(),
	countryCode: text("country_code"),
	currency: text().notNull(),
}, (table) => [
	unique("countries_country_name_key").on(table.countryName),
]);

export const documentType = pgTable("document_type", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	countryId: uuid("country_id").notNull(),
	name: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.countryId],
			foreignColumns: [countries.id],
			name: "document_type_country_id_countries_id_fk"
		}),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean().notNull(),
	image: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	role: text(),
	banned: boolean(),
	banReason: text(),
	banExpires: timestamp({ withTimezone: true, mode: 'string' }),
	isAnonymous: boolean(),
	phoneNumber: text(),
	phoneNumberVerified: boolean(),
	userMetadata: jsonb(),
	appMetadata: jsonb(),
	invitedAt: timestamp({ withTimezone: true, mode: 'string' }),
	lastSignInAt: timestamp({ withTimezone: true, mode: 'string' }),
	documentId: text("document_id"),
	documentTypeId: uuid("document_type_id"),
	gender: genderType(),
	birthdate: timestamp({ withTimezone: true, mode: 'string' }),
	tipoPersona: text("tipo_persona"),
	nombres: text(),
	apellidos: text(),
	razonSocial: text("razon_social"),
	nit: text(),
}, (table) => [
	foreignKey({
			columns: [table.documentTypeId],
			foreignColumns: [documentType.id],
			name: "user_document_type_id_document_type_id_fk"
		}),
	unique("user_email_key").on(table.email),
	unique("user_phoneNumber_key").on(table.phoneNumber),
]);

export const invitation = pgTable("invitation", {
	id: text().primaryKey().notNull(),
	organizationId: text().notNull(),
	email: text().notNull(),
	role: memberRole().default('seller'),
	status: text().default('pending').notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	inviterId: text().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.inviterId],
			foreignColumns: [user.id],
			name: "invitation_inviterId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "invitation_organizationId_fkey"
		}).onDelete("cascade"),
]);

export const member = pgTable("member", {
	id: text().primaryKey().notNull(),
	organizationId: text().notNull(),
	userId: text().notNull(),
	role: memberRole().default('seller').notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "member_organizationId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "member_userId_fkey"
		}).onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	eventId: uuid("event_id").notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	paymentStatus: orderPaymentStatus("payment_status").default('pending').notNull(),
	paymentSessionId: text("payment_session_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	paidAt: timestamp("paid_at", { withTimezone: true, mode: 'string' }),
	platform: orderFrom().default('cash').notNull(),
	currency: text().default('COP').notNull(),
	marketplaceFee: numeric("marketplace_fee", { precision: 10, scale:  2 }),
	processorFee: numeric("processor_fee", { precision: 10, scale:  2 }),
	soldBy: text("sold_by"),
}, (table) => [
	index("idx_orders_event").using("btree", table.eventId.asc().nullsLast().op("uuid_ops")),
	index("idx_orders_payment_session").using("btree", table.paymentSessionId.asc().nullsLast().op("text_ops")).where(sql`(payment_session_id IS NOT NULL)`),
	index("idx_orders_payment_status").using("btree", table.paymentStatus.asc().nullsLast().op("enum_ops")),
	index("idx_orders_sold_by").using("btree", table.soldBy.asc().nullsLast().op("text_ops")),
	index("idx_orders_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "orders_event_id_events_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.soldBy],
			foreignColumns: [user.id],
			name: "orders_sold_by_user_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "orders_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const emailLogs = pgTable("email_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	emailType: text("email_type").notNull(),
	recipientEmail: text("recipient_email").notNull(),
	emailServiceId: text("email_service_id"),
	status: text().default('sent').notNull(),
	metadata: jsonb(),
	sentAt: timestamp("sent_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_email_logs_order").using("btree", table.orderId.asc().nullsLast().op("uuid_ops")),
	index("idx_email_logs_recipient").using("btree", table.recipientEmail.asc().nullsLast().op("text_ops")),
	index("idx_email_logs_service_id").using("btree", table.emailServiceId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "email_logs_order_id_orders_id_fk"
		}).onDelete("cascade"),
]);

export const orderItems = pgTable("order_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	ticketTypeId: uuid("ticket_type_id").notNull(),
	quantity: integer().notNull(),
	pricePerTicket: numeric("price_per_ticket", { precision: 10, scale:  2 }).notNull(),
	subtotal: numeric({ precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_order_items_order").using("btree", table.orderId.asc().nullsLast().op("uuid_ops")),
	index("idx_order_items_ticket_type").using("btree", table.ticketTypeId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.ticketTypeId],
			foreignColumns: [ticketTypes.id],
			name: "order_items_ticket_type_id_ticket_types_id_fk"
		}).onDelete("cascade"),
]);

export const reservations = pgTable("reservations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	eventId: uuid("event_id").notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	status: reservationStatus().default('active').notNull(),
	paymentSessionId: text("payment_session_id"),
	paymentProcessor: text("payment_processor"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_reservations_active_expires").using("btree", table.status.asc().nullsLast().op("enum_ops"), table.expiresAt.asc().nullsLast().op("enum_ops")).where(sql`(status = 'active'::reservation_status)`),
	index("idx_reservations_event").using("btree", table.eventId.asc().nullsLast().op("uuid_ops")),
	index("idx_reservations_expires").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_reservations_payment_session").using("btree", table.paymentSessionId.asc().nullsLast().op("text_ops")),
	index("idx_reservations_status_expires").using("btree", table.status.asc().nullsLast().op("enum_ops"), table.expiresAt.asc().nullsLast().op("timestamptz_ops")).where(sql`(status = 'active'::reservation_status)`),
	index("idx_reservations_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("idx_reservations_user_status").using("btree", table.userId.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "reservations_event_id_events_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "reservations_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("reservations_payment_session_id_unique").on(table.paymentSessionId),
]);

export const ticketTypes = pgTable("ticket_types", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventId: uuid("event_id").notNull(),
	name: text().notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	capacity: integer().notNull(),
	soldCount: integer("sold_count").default(0).notNull(),
	reservedCount: integer("reserved_count").default(0).notNull(),
	minPerOrder: integer("min_per_order").default(1).notNull(),
	maxPerOrder: integer("max_per_order").default(10).notNull(),
	saleStart: timestamp("sale_start", { withTimezone: true, mode: 'string' }),
	saleEnd: timestamp("sale_end", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	active: boolean(),
}, (table) => [
	index("idx_ticket_types_availability").using("btree", sql`event_id`, sql`(((capacity - sold_count) - reserved_count))`).where(sql`(((capacity - sold_count) - reserved_count) > 0)`),
	index("idx_ticket_types_event").using("btree", table.eventId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "ticket_types_event_id_events_id_fk"
		}).onDelete("cascade"),
	check("check_counts_non_negative", sql`(sold_count >= 0) AND (reserved_count >= 0) AND (capacity > 0)`),
	check("check_order_limits", sql`(min_per_order > 0) AND (max_per_order >= min_per_order)`),
	check("check_sold_not_exceeded", sql`sold_count <= capacity`),
]);

export const reservationItems = pgTable("reservation_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	reservationId: uuid("reservation_id").notNull(),
	ticketTypeId: uuid("ticket_type_id").notNull(),
	quantity: integer().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_reservation_items_reservation").using("btree", table.reservationId.asc().nullsLast().op("uuid_ops")),
	index("idx_reservation_items_ticket_type").using("btree", table.ticketTypeId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.reservationId],
			foreignColumns: [reservations.id],
			name: "reservation_items_reservation_id_reservations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.ticketTypeId],
			foreignColumns: [ticketTypes.id],
			name: "reservation_items_ticket_type_id_ticket_types_id_fk"
		}).onDelete("cascade"),
]);

export const tickets = pgTable("tickets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	reservationId: uuid("reservation_id"),
	ticketTypeId: uuid("ticket_type_id").notNull(),
	userId: text("user_id").notNull(),
	qrCode: text("qr_code").notNull(),
	status: ticketStatus().default('valid').notNull(),
	scannedAt: timestamp("scanned_at", { withTimezone: true, mode: 'string' }),
	scannedBy: text("scanned_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	platform: orderFrom().default('cash').notNull(),
}, (table) => [
	index("idx_tickets_order").using("btree", table.orderId.asc().nullsLast().op("uuid_ops")),
	index("idx_tickets_qr_code").using("btree", table.qrCode.asc().nullsLast().op("text_ops")),
	index("idx_tickets_reservation").using("btree", table.reservationId.asc().nullsLast().op("uuid_ops")),
	index("idx_tickets_ticket_type").using("btree", table.ticketTypeId.asc().nullsLast().op("uuid_ops")),
	index("idx_tickets_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "tickets_order_id_orders_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reservationId],
			foreignColumns: [reservations.id],
			name: "tickets_reservation_id_reservations_id_fk"
		}),
	foreignKey({
			columns: [table.scannedBy],
			foreignColumns: [user.id],
			name: "tickets_scanned_by_user_id_fk"
		}),
	foreignKey({
			columns: [table.ticketTypeId],
			foreignColumns: [ticketTypes.id],
			name: "tickets_ticket_type_id_ticket_types_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "tickets_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("tickets_qr_code_unique").on(table.qrCode),
]);

export const events = pgTable("events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	name: text(),
	description: text(),
	date: timestamp({ withTimezone: true, mode: 'string' }),
	endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }),
	status: boolean().default(false),
	flyer: text(),
	venueId: uuid("venue_id"),
	variableFee: numeric("variable_fee"),
	fixedFee: numeric("fixed_fee"),
	age: numeric(),
	cash: boolean().default(false).notNull(),
	extraInfo: text("extra_info"),
	ics: text(),
	flyerApple: text("flyer_apple"),
	flyerGoogle: text("flyer_google"),
	flyerOverlay: text("flyer_overlay"),
	flyerBackground: text("flyer_background"),
	flyerBanner: text("flyer_banner"),
	posFee: numeric("pos_fee"),
	hex: text(),
	priority: boolean().default(false).notNull(),
	hexText: text("hex_text"),
	guestList: boolean("guest_list").default(false).notNull(),
	privateList: boolean("private_list").default(false).notNull(),
	accessPass: boolean("access_pass").default(false).notNull(),
	guestListMaxHour: timestamp("guest_list_max_hour", { withTimezone: true, mode: 'string' }),
	guestListQuantity: numeric("guest_list_quantity"),
	guestListInfo: text("guest_list_info"),
	hexTextSecondary: text("hex_text_secondary").default('A3A3A3').notNull(),
	lateFee: numeric("late_fee"),
	guestEmail: text("guest_email"),
	guestName: text("guest_name"),
	faqs: jsonb(),
	city: text(),
	country: text(),
}, (table) => [
	index("idx_events_date").using("btree", table.date.asc().nullsLast().op("timestamptz_ops")),
	index("idx_events_date_range").using("btree", table.date.asc().nullsLast().op("timestamptz_ops"), table.endDate.asc().nullsLast().op("timestamptz_ops")),
	index("idx_events_end_date").using("btree", table.endDate.asc().nullsLast().op("timestamptz_ops")),
	index("idx_events_org_status_date").using("btree", table.organizationId.asc().nullsLast().op("bool_ops"), table.status.asc().nullsLast().op("text_ops"), table.date.asc().nullsLast().op("bool_ops")),
	index("idx_events_organization_id").using("btree", table.organizationId.asc().nullsLast().op("text_ops")),
	index("idx_events_status_end_date").using("btree", table.status.asc().nullsLast().op("bool_ops"), table.endDate.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "events_organization_id_organization_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.venueId],
			foreignColumns: [venues.id],
			name: "events_venue_id_venues_id_fk"
		}),
]);

export const organization = pgTable("organization", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	logo: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	metadata: text(),
	tipoOrganizacion: text("tipo_organizacion"),
	nombres: text(),
	apellidos: text(),
	tipoDocumento: text("tipo_documento"),
	numeroDocumento: text("numero_documento"),
	nit: text(),
	direccion: text(),
	correoElectronico: text("correo_electronico"),
	rutUrl: text("rut_url"),
	cerlUrl: text("cerl_url"),
}, (table) => [
	unique("organization_slug_key").on(table.slug),
]);

export const legacyEvents = pgTable("legacy_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	name: text(),
	description: text(),
	date: timestamp({ withTimezone: true, mode: 'string' }),
	endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }),
	status: boolean().default(false),
	flyer: text(),
	venueId: uuid("venue_id"),
	variableFee: numeric("variable_fee"),
	fixedFee: numeric("fixed_fee"),
	age: numeric(),
	cash: boolean().default(false).notNull(),
	extraInfo: text("extra_info"),
	ics: text(),
	flyerApple: text("flyer_apple"),
	flyerGoogle: text("flyer_google"),
	flyerOverlay: text("flyer_overlay"),
	flyerBackground: text("flyer_background"),
	flyerBanner: text("flyer_banner"),
	posFee: numeric("pos_fee"),
	hex: text(),
	priority: boolean().default(false).notNull(),
	hexText: text("hex_text"),
	guestList: boolean("guest_list").default(false).notNull(),
	privateList: boolean("private_list").default(false).notNull(),
	accessPass: boolean("access_pass").default(false).notNull(),
	guestListMaxHour: timestamp("guest_list_max_hour", { withTimezone: true, mode: 'string' }),
	guestListQuantity: numeric("guest_list_quantity"),
	guestListInfo: text("guest_list_info"),
	hexTextSecondary: text("hex_text_secondary").default('A3A3A3').notNull(),
	lateFee: numeric("late_fee"),
	guestEmail: text("guest_email"),
	guestName: text("guest_name"),
	faqs: jsonb(),
}, (table) => [
	index("idx_legacy_events_date").using("btree", table.date.asc().nullsLast().op("timestamptz_ops")),
	index("idx_legacy_events_end_date").using("btree", table.endDate.asc().nullsLast().op("timestamptz_ops")),
	index("idx_legacy_events_status_end_date").using("btree", table.status.asc().nullsLast().op("timestamptz_ops"), table.endDate.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.venueId],
			foreignColumns: [legacyVenues.id],
			name: "legacy_events_legacy_venueId_fkey"
		}).onDelete("cascade"),
]);

export const venues = pgTable("venues", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	description: text(),
	address: text(),
	city: text(),
	country: text(),
	postalCode: text("postal_code"),
	state: text(),
	latitude: text(),
	longitude: text(),
	logo: text(),
	banner: text(),
	link: text(),
	staticMapUrl: text("static_map_url"),
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
	timezoneId: text("timezone_id"),
	timezoneName: text("timezone_name"),
	utcOffset: numeric("utc_offset"),
	dtsOffset: numeric("dts_offset"),
	currencyCode: text("currency_code"),
	wheelchairAccessible: boolean("wheelchair_accessible"),
	venueType: text("venue_type"),
	aiDescription: text("ai_description"),
	instagram: text(),
}, (table) => [
	index("idx_venues_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);
