import { TransactionState, TransactionError } from '@/app/types/transaction';

export function getStatusLabel(state: TransactionState): string {
  const labels: Record<TransactionState, string> = {
    idle: 'Ready',
    building: 'Preparing transaction...',
    'awaiting-signature': 'Waiting for wallet signature...',
    submitting: 'Submitting to network...',
    confirming: 'Confirming on blockchain...',
    success: 'Transaction complete!',
    error: 'Transaction failed',
  };
  return labels[state];
}

export function getStatusColor(state: TransactionState): string {
  const colors: Record<TransactionState, string> = {
    idle: 'text-gray-500',
    building: 'text-blue-500',
    'awaiting-signature': 'text-yellow-500',
    submitting: 'text-orange-500',
    confirming: 'text-purple-500',
    success: 'text-green-500',
    error: 'text-red-500',
  };
  return colors[state];
}

export function getStatusIcon(state: TransactionState): string {
  const icons: Record<TransactionState, string> = {
    idle: '⏸️',
    building: '🔧',
    'awaiting-signature': '✍️',
    submitting: '📡',
    confirming: '⏳',
    success: '✅',
    error: '❌',
  };
  return icons[state];
}

export function formatTransactionError(error: TransactionError): {
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

export function getExplorerLink(txHash: string, network: 'testnet' | 'public' = 'testnet'): string {
  const base = network === 'public' 
    ? 'https://stellar.expert/explorer/public' 
    : 'https://stellar.expert/explorer/testnet';
  return `${base}/tx/${txHash}`;
}