/**
 * Unified transaction lifecycle states
 * Used across all money flows: lend, repay, send-remittance, loan-wizard
 */
export type TransactionState = 
  | 'idle'
  | 'building'
  | 'awaiting-signature'
  | 'submitting'
  | 'confirming'
  | 'success'
  | 'error';

export interface TransactionContext {
  operation: string;           // e.g., 'deposit', 'withdraw', 'repay', 'remit'
  amount?: string;
  asset?: string;
  destination?: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionLifecycle {
  state: TransactionState;
  context: TransactionContext;
  error: TransactionError | null;
  txHash: string | null;
  startedAt: number | null;
  completedAt: number | null;
}

export interface TransactionError {
  code: TransactionErrorCode;
  message: string;
  actionable: string;          // User-facing actionable message
  retryable: boolean;
  originalError?: unknown;
}

export type TransactionErrorCode =
  | 'USER_REJECTED'
  | 'INSUFFICIENT_FEE'
  | 'TIMEOUT'
  | 'SEQUENCE_MISMATCH'
  | 'CONTRACT_ERROR'
  | 'NETWORK_ERROR'
  | 'BUILD_ERROR'
  | 'UNKNOWN';