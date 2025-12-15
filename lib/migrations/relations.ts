import { relations } from "drizzle-orm/relations";
import { user, session, account, passkey, organization, paymentProcessorAccount, countries, documentType, invitation, member, events, orders, emailLogs, orderItems, ticketTypes, reservations, reservationItems, tickets, venues, legacyVenues, legacyEvents } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({one, many}) => ({
	sessions: many(session),
	accounts: many(account),
	passkeys: many(passkey),
	paymentProcessorAccounts: many(paymentProcessorAccount),
	documentType: one(documentType, {
		fields: [user.documentTypeId],
		references: [documentType.id]
	}),
	invitations: many(invitation),
	members: many(member),
	orders_soldBy: many(orders, {
		relationName: "orders_soldBy_user_id"
	}),
	orders_userId: many(orders, {
		relationName: "orders_userId_user_id"
	}),
	reservations: many(reservations),
	tickets_scannedBy: many(tickets, {
		relationName: "tickets_scannedBy_user_id"
	}),
	tickets_userId: many(tickets, {
		relationName: "tickets_userId_user_id"
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const passkeyRelations = relations(passkey, ({one}) => ({
	user: one(user, {
		fields: [passkey.userId],
		references: [user.id]
	}),
}));

export const paymentProcessorAccountRelations = relations(paymentProcessorAccount, ({one}) => ({
	organization: one(organization, {
		fields: [paymentProcessorAccount.organizationId],
		references: [organization.id]
	}),
	user: one(user, {
		fields: [paymentProcessorAccount.userId],
		references: [user.id]
	}),
}));

export const organizationRelations = relations(organization, ({many}) => ({
	paymentProcessorAccounts: many(paymentProcessorAccount),
	invitations: many(invitation),
	members: many(member),
	events: many(events),
}));

export const documentTypeRelations = relations(documentType, ({one, many}) => ({
	country: one(countries, {
		fields: [documentType.countryId],
		references: [countries.id]
	}),
	users: many(user),
}));

export const countriesRelations = relations(countries, ({many}) => ({
	documentTypes: many(documentType),
}));

export const invitationRelations = relations(invitation, ({one}) => ({
	user: one(user, {
		fields: [invitation.inviterId],
		references: [user.id]
	}),
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id]
	}),
}));

export const memberRelations = relations(member, ({one}) => ({
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id]
	}),
	user: one(user, {
		fields: [member.userId],
		references: [user.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	event: one(events, {
		fields: [orders.eventId],
		references: [events.id]
	}),
	user_soldBy: one(user, {
		fields: [orders.soldBy],
		references: [user.id],
		relationName: "orders_soldBy_user_id"
	}),
	user_userId: one(user, {
		fields: [orders.userId],
		references: [user.id],
		relationName: "orders_userId_user_id"
	}),
	emailLogs: many(emailLogs),
	orderItems: many(orderItems),
	tickets: many(tickets),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	orders: many(orders),
	reservations: many(reservations),
	ticketTypes: many(ticketTypes),
	organization: one(organization, {
		fields: [events.organizationId],
		references: [organization.id]
	}),
	venue: one(venues, {
		fields: [events.venueId],
		references: [venues.id]
	}),
}));

export const emailLogsRelations = relations(emailLogs, ({one}) => ({
	order: one(orders, {
		fields: [emailLogs.orderId],
		references: [orders.id]
	}),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	ticketType: one(ticketTypes, {
		fields: [orderItems.ticketTypeId],
		references: [ticketTypes.id]
	}),
}));

export const ticketTypesRelations = relations(ticketTypes, ({one, many}) => ({
	orderItems: many(orderItems),
	event: one(events, {
		fields: [ticketTypes.eventId],
		references: [events.id]
	}),
	reservationItems: many(reservationItems),
	tickets: many(tickets),
}));

export const reservationsRelations = relations(reservations, ({one, many}) => ({
	event: one(events, {
		fields: [reservations.eventId],
		references: [events.id]
	}),
	user: one(user, {
		fields: [reservations.userId],
		references: [user.id]
	}),
	reservationItems: many(reservationItems),
	tickets: many(tickets),
}));

export const reservationItemsRelations = relations(reservationItems, ({one}) => ({
	reservation: one(reservations, {
		fields: [reservationItems.reservationId],
		references: [reservations.id]
	}),
	ticketType: one(ticketTypes, {
		fields: [reservationItems.ticketTypeId],
		references: [ticketTypes.id]
	}),
}));

export const ticketsRelations = relations(tickets, ({one}) => ({
	order: one(orders, {
		fields: [tickets.orderId],
		references: [orders.id]
	}),
	reservation: one(reservations, {
		fields: [tickets.reservationId],
		references: [reservations.id]
	}),
	user_scannedBy: one(user, {
		fields: [tickets.scannedBy],
		references: [user.id],
		relationName: "tickets_scannedBy_user_id"
	}),
	ticketType: one(ticketTypes, {
		fields: [tickets.ticketTypeId],
		references: [ticketTypes.id]
	}),
	user_userId: one(user, {
		fields: [tickets.userId],
		references: [user.id],
		relationName: "tickets_userId_user_id"
	}),
}));

export const venuesRelations = relations(venues, ({many}) => ({
	events: many(events),
}));

export const legacyEventsRelations = relations(legacyEvents, ({one}) => ({
	legacyVenue: one(legacyVenues, {
		fields: [legacyEvents.venueId],
		references: [legacyVenues.id]
	}),
}));

export const legacyVenuesRelations = relations(legacyVenues, ({many}) => ({
	legacyEvents: many(legacyEvents),
}));