import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";

// Hunt-specific permission statements
const statement = {
  ...defaultStatements,
} as const;

const ac = createAccessControl(statement);

// Seller role - basic access, cannot invite (inherits from default member)
const seller = ac.newRole({
  invitation: [],
  member: [],
  organization: [],
});

// Administrator role - can invite others to organization
const administrator = ac.newRole({
  invitation: ["create", "cancel"],
  member: [],
  organization: [],
});

// Owner role - can invite others to organization and manage organization
const owner = ac.newRole({
  invitation: ["create", "cancel"],
  member: ["create", "update", "delete"],
  organization: ["update", "delete"],
});

export { ac, administrator, seller, owner, statement };
