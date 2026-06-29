import type { TransactionErrorDetails } from "@/app/utils/transactionErrors";

export type TransactionState =
  | "idle"
  | "building"
  | "awaiting-signature"
  | "submitting"
  | "confirming"
  | "success"
  | "error";

export interface TransactionContext {
  operation: string;
  amount?: string;
  asset?: string;
  destination?: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionLifecycle {
  state: TransactionState;
  context: TransactionContext;
  error: TransactionErrorDetails | null;
  txHash: string | null;
  startedAt: number | null;
  completedAt: number | null;
}