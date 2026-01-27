import { relations } from "drizzle-orm/relations";
import {
  user,
  session,
  account,
  passkey,
  organization,
  member,
  invitation,
  events,
  ticketTypes,
  orders,
  orderItems,
  refunds,
  paymentProcessorAccount,
  venues,
} from "./schema";

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
  activeOrganization: one(organization, {
    fields: [session.activeOrganizationId],
    references: [organization.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  passkeys: many(passkey),
  members: many(member),
  invitations: many(invitation),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, {
    fields: [passkey.userId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  paymentProcessorAccount: many(paymentProcessorAccount),
}));

export const paymentProcessorAccountRelations = relations(
  paymentProcessorAccount,
  ({ one }) => ({
    organization: one(organization, {
      fields: [paymentProcessorAccount.organizationId],
      references: [organization.id],
    }),
  }),
);

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organization: one(organization, {
    fields: [events.organizationId],
    references: [organization.id],
  }),
  ticketTypes: many(ticketTypes),
  orders: many(orders),
  venues: one(venues, {
    fields: [events.venueId],
    references: [venues.id],
  }),
}));

export const ticketTypesRelations = relations(ticketTypes, ({ one }) => ({
  event: one(events, {
    fields: [ticketTypes.eventId],
    references: [events.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  event: one(events, {
    fields: [orders.eventId],
    references: [events.id],
  }),
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  soldBy: one(user, {
    fields: [orders.soldBy],
    references: [user.id],
  }),
  orderItems: many(orderItems),
  refunds: many(refunds),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  ticketType: one(ticketTypes, {
    fields: [orderItems.ticketTypeId],
    references: [ticketTypes.id],
  }),
}));

export const refundsRelations = relations(refunds, ({ one }) => ({
  order: one(orders, {
    fields: [refunds.orderId],
    references: [orders.id],
  }),
  event: one(events, {
    fields: [refunds.eventId],
    references: [events.id],
  }),
}));
