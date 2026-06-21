import { TransactionError, TransactionErrorCode } from '@/app/types/transaction';

interface ErrorMapping {
  code: TransactionErrorCode;
  message: string;
  actionable: string;
  retryable: boolean;
}

export interface PollTransactionOptions {
  horizonUrl?: string;
  intervalMs?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface PollTransactionResult {
  status: "success" | "failed" | "timeout" | "cancelled";
  message: string;
}

const DEFAULT_HORIZON_URL = "https://horizon-testnet.stellar.org";

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown transaction error";
  }
}

export function mapTransactionError(error: unknown): TransactionErrorDetails {
  const rawMessage = toErrorMessage(error);
  const normalized = rawMessage.toLowerCase();

  if (
    normalized.includes("rejected") ||
    normalized.includes("denied") ||
    normalized.includes("cancelled") ||
    normalized.includes("canceled") ||
    normalized.includes("declined")
  ) {
    return {
      category: "wallet_rejected",
      title: "Transaction cancelled",
      message: "You cancelled the signing request in your wallet.",
      guidance:
        "No funds moved. You can review details and submit again when ready.",
      retryable: true,
      cancelledByUser: true,
    };
  }

  if (
    normalized.includes("timeout") ||
    normalized.includes("network") ||
    normalized.includes("failed to fetch")
  ) {
    return {
      category: "network_timeout",
      title: "Network issue",
      message: "The network request timed out or could not be completed.",
      guidance:
        "Check connectivity and retry. If it keeps failing, try again in a few minutes.",
      retryable: true,
      cancelledByUser: false,
    };
  }

  if (
    normalized.includes("insufficient") &&
    (normalized.includes("balance") || normalized.includes("fund"))
  ) {
    return {
      category: "insufficient_balance",
      title: "Insufficient balance",
      message: "Your available balance is too low for this transaction.",
      guidance: "Reduce the amount or fund your wallet, then try again.",
      retryable: false,
      cancelledByUser: false,
    };
  }

  if (
    normalized.includes("score too low") ||
    normalized.includes("insufficient score") ||
    normalized.includes("insufficientscore")
  ) {
    return {
      category: "score_too_low",
      title: "Loan request not eligible",
      message: "Your credit score does not meet the minimum requirement.",
      guidance:
        "Repay active loans on time and retry after your score improves.",
      retryable: false,
      cancelledByUser: false,
    };
  }

  if (normalized.includes("simulation") || normalized.includes("host error")) {
    return {
      category: "simulation_failed",
      title: "Simulation failed",
      message: "The contract simulation failed before submission.",
      guidance: "Review your values and wallet state, then retry.",
      retryable: true,
      cancelledByUser: false,
    };
  }

  if (
    normalized.includes("failed on-chain") ||
    normalized.includes("tx failed") ||
    normalized.includes("revert")
  ) {
    return {
      category: "onchain_failure",
      title: "Transaction failed on-chain",
      message: "The transaction was submitted but did not succeed on-chain.",
      guidance:
        "Check the transaction hash details and adjust inputs before retrying.",
      retryable: false,
      cancelledByUser: false,
    };
  }

  return {
    category: "unknown",
    title: "Transaction failed",
    message: rawMessage,
    guidance:
      "Try again, or adjust the amount and wallet state before retrying.",
const ERROR_MAP: Record<string, ErrorMapping> = {
  // Wallet/user errors
  'User declined': {
    code: 'USER_REJECTED',
    message: 'Transaction was rejected by user',
    actionable: 'Please approve the transaction in your wallet to continue.',
    retryable: true,
  },
  'User rejected': {
    code: 'USER_REJECTED',
    message: 'Transaction was rejected by user',
    actionable: 'Please approve the transaction in your wallet to continue.',
    retryable: true,
  },
  'cancelled': {
    code: 'USER_REJECTED',
    message: 'Transaction was cancelled',
    actionable: 'You cancelled the signing process. Click retry to try again.',
    retryable: true,
  },

  // Fee errors
  'insufficient fee': {
    code: 'INSUFFICIENT_FEE',
    message: 'Insufficient fee to submit transaction',
    actionable: 'Your wallet balance is too low to cover the network fee. Please add more XLM and retry.',
    retryable: true,
  },
  'tx_insufficient_fee': {
    code: 'INSUFFICIENT_FEE',
    message: 'Insufficient fee to submit transaction',
    actionable: 'Your wallet balance is too low to cover the network fee. Please add more XLM and retry.',
    retryable: true,
  },

  // Timeout
  'timeout': {
    code: 'TIMEOUT',
    message: 'Transaction confirmation timed out',
    actionable: 'The network is experiencing delays. Your transaction may still complete. Check your history before retrying.',
    retryable: true,
  },
  'tx_too_late': {
    code: 'TIMEOUT',
    message: 'Transaction expired before confirmation',
    actionable: 'The transaction expired. Please retry with an updated sequence number.',
    retryable: true,
  },

  // Sequence errors
  'bad_seq': {
    code: 'SEQUENCE_MISMATCH',
    message: 'Transaction sequence number mismatch',
    actionable: 'Your wallet sequence number is out of sync. Please refresh and retry.',
    retryable: true,
  },
  'sequence': {
    code: 'SEQUENCE_MISMATCH',
    message: 'Transaction sequence number mismatch',
    actionable: 'Your wallet sequence number is out of sync. Please refresh and retry.',
    retryable: true,
  },

  // Contract errors
  'contract_error': {
    code: 'CONTRACT_ERROR',
    message: 'Smart contract execution failed',
    actionable: 'The transaction failed during execution. Please verify your inputs and try again.',
    retryable: false,
  },
  'invoke_host_function': {
    code: 'CONTRACT_ERROR',
    message: 'Smart contract execution failed',
    actionable: 'The transaction failed during execution. Please verify your inputs and try again.',
    retryable: false,
  },

export async function pollTransactionStatus(
  txHash: string,
  {
    horizonUrl = process.env.NEXT_PUBLIC_HORIZON_URL ?? DEFAULT_HORIZON_URL,
    intervalMs = 2500,
    timeoutMs = 30000,
    signal,
  }: PollTransactionOptions = {},
): Promise<PollTransactionResult> {
  const startedAt = Date.now();
  // Network
  'network_error': {
    code: 'NETWORK_ERROR',
    message: 'Network connection error',
    actionable: 'Unable to connect to the Stellar network. Please check your connection and retry.',
    retryable: true,
  },
  'connection': {
    code: 'NETWORK_ERROR',
    message: 'Network connection error',
    actionable: 'Unable to connect to the Stellar network. Please check your connection and retry.',
    retryable: true,
  },
};

export function mapTransactionError(error: unknown): TransactionError {
  const errorMessage = extractErrorMessage(error).toLowerCase();
  
  // Find matching error pattern
  for (const [pattern, mapping] of Object.entries(ERROR_MAP)) {
    if (errorMessage.includes(pattern.toLowerCase())) {
      return {
        ...mapping,
        originalError: error,
      };
    }
  }

  // Fallback for unknown errors
  return {
    code: 'UNKNOWN',
    message: extractErrorMessage(error) || 'An unexpected error occurred',
    actionable: 'Something went wrong. Please try again or contact support if the issue persists.',
    retryable: true,
    originalError: error,
  };
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as Record<string, unknown>).message);
  }
  return 'Unknown error';
}

export function isRetryableError(error: TransactionError): boolean {
  return error.retryable;
}

export function getErrorDisplay(error: TransactionError): {
  title: string;
  description: string;
  action: string;
  canRetry: boolean;
} {
  return {
    title: error.code.replace(/_/g, ' '),
    description: error.message,
    action: error.actionable,
    canRetry: error.retryable,
  };
}