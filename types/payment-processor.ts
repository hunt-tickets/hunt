// Shared payment processor types

export type PaymentProcessorType = "stripe" | "mercadopago" | "toast";

export type PaymentProcessorStatus =
  | "active"
  | "inactive"
  | "expired"
  | "revoked"
  | "pending"
  | "suspended";

export interface PaymentProcessorAccount {
  id: string;
  processorType: PaymentProcessorType;
  processorAccountId: string;
  status: PaymentProcessorStatus;
  tokenExpiresAt?: string | Date | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
  createdAt: string | Date;
  updatedAt: string | Date;
}
