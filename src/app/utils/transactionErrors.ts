import { TransactionError, TransactionErrorCode } from '@/app/types/transaction';

interface ErrorMapping {
  code: TransactionErrorCode;
  message: string;
  actionable: string;
  retryable: boolean;
}

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