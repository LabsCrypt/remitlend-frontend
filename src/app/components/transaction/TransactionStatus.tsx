'use client';

import { TransactionLifecycle } from '@/app/types/transaction';
import { getStatusLabel, getStatusColor, getStatusIcon, formatTransactionError, getExplorerLink } from '@/app/utils/transactionFormatter';
import { Button } from '@/app/components/global_ui/Button'; // Assuming this exists or use standard button

interface TransactionStatusProps {
  lifecycle: TransactionLifecycle;
  onRetry: () => void;
  onReset: () => void;
  network?: 'testnet' | 'public';
}

export function TransactionStatus({ lifecycle, onRetry, onReset, network = 'testnet' }: TransactionStatusProps) {
  const { state, error, txHash } = lifecycle;

  if (state === 'idle') return null;

  return (
    <div className="rounded-lg border p-4 space-y-3 bg-white dark:bg-gray-900">
      {/* Status Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getStatusIcon(state)}</span>
        <div className="flex-1">
          <p className={`font-medium ${getStatusColor(state)}`}>
            {getStatusLabel(state)}
          </p>
          {txHash && state !== 'success' && (
            <p className="text-xs text-gray-500 truncate">
              Hash: {txHash.slice(0, 8)}...{txHash.slice(-8)}
            </p>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      {state !== 'error' && state !== 'success' && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: state === 'building' ? '20%' : 
                     state === 'awaiting-signature' ? '40%' : 
                     state === 'submitting' ? '60%' : 
                     state === 'confirming' ? '80%' : '0%' 
            }}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 space-y-2">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {formatTransactionError(error).title}
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            {formatTransactionError(error).description}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">
            💡 {formatTransactionError(error).action}
          </p>
        </div>
      )}

      {/* Success Display */}
      {state === 'success' && txHash && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3">
          <p className="text-sm text-green-800 dark:text-green-200">
            Transaction confirmed successfully!
          </p>
          <a 
            href={getExplorerLink(txHash, network)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline mt-1 inline-block"
          >
            View on Stellar Expert →
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {state === 'error' && formatTransactionError(error!).canRetry && (
          <Button onClick={onRetry} variant="primary">
            Retry Transaction
          </Button>
        )}
        {(state === 'success' || state === 'error') && (
          <Button onClick={onReset} variant="secondary">
            {state === 'success' ? 'Done' : 'Cancel'}
          </Button>
        )}
      </div>
    </div>
  );
}