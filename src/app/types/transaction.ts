/**
 * Unified transaction lifecycle states
 * Used across all money flows: lend, repay, send-remittance, loan-wizard
 */
export type TransactionState =
  | "idle"
  | "building"
  | "awaiting-signature"
  | "submitting"
  | "confirming"
  | "success"
  | "error";

export interface TransactionContext {
  operation: string; // e.g., 'deposit', 'withdraw', 'repay', 'remit'
  amount?: string;
  asset?: string;
  destination?: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionError {
  category: TransactionErrorCategory;
  title: string;
  message: string;
  guidance: string;
  retryable: boolean;
  cancelledByUser: boolean;
  originalError?: unknown;
}

export type TransactionErrorCategory =
  | "wallet_rejected"
  | "network_timeout"
  | "insufficient_balance"
  | "score_too_low"
  | "onchain_failure"
  | "simulation_failed"
  | "unknown";

export interface TransactionLifecycle {
  state: TransactionState;
  context: TransactionContext;
  error: TransactionError | null;
  txHash: string | null;
  startedAt: number | null;
  completedAt: number | null;
}