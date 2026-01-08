import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";

// Hunt-specific permission statements
const statement = {
  ...defaultStatements,
  // Event management
  event: ["create", "update", "delete", "sell", "cancel", "archive"],
  // Organization dashboard/analytics access
  dashboard: ["view"],
  analytics: ["view"],
  // Payment processor management
  payment: ["manage"],
} as const;

const ac = createAccessControl(statement);

// Seller role - can only sell tickets and view their own sales
// No access to dashboard, analytics, or event management
const seller = ac.newRole({
  invitation: [],
  member: [],
  organization: [],
  event: ["sell"],
  dashboard: [],
  analytics: [],
  payment: [],
});

// Administrator role - same as owner (including destructive operations on Events) except cannot promote members to owner
// (owner promotion restriction is handled in application logic)
const administrator = ac.newRole({
  invitation: ["create", "cancel"],
  member: ["create", "update", "delete"],
  organization: ["update"],
  event: ["create", "update", "delete", "sell", "cancel", "archive"],
  dashboard: ["view"],
  analytics: ["view"],
  payment: ["manage"],
});

// Owner role - full access to everything
const owner = ac.newRole({
  invitation: ["create", "cancel"],
  member: ["create", "update", "delete"],
  organization: ["update", "delete"],
  event: ["create", "update", "delete", "sell", "cancel", "archive"],
  dashboard: ["view"],
  analytics: ["view"],
  payment: ["manage"],
});

export { ac, administrator, seller, owner, statement };
