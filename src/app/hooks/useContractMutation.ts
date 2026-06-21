'use client';

import { useCallback } from 'react';
import { useTransactionLifecycle } from './useTransactionLifecycle';
import { TransactionContext } from '@/app/types/transaction';

interface ContractMutationOptions<TData, TVariables> {
  operation: string;
  buildTx: (variables: TVariables) => Promise<string>; // Returns XDR
  signTx: (xdr: string) => Promise<string>; // Returns signed XDR
  submitTx: (signedXdr: string) => Promise<{ hash: string }>;
  confirmTx: (hash: string) => Promise<boolean>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  invalidateQueries?: string[];
}

export function useContractMutation<TData = unknown, TVariables = unknown>(
  options: ContractMutationOptions<TData, TVariables>
) {
  const { lifecycle, transition, canSubmit, isProcessing } = useTransactionLifecycle();

  const mutate = useCallback(
    async (variables: TVariables) => {
      if (!canSubmit) {
        throw new Error('Transaction already in progress');
      }

      const context: TransactionContext = {
        operation: options.operation,
        metadata: variables as Record<string, unknown>,
      };

      try {
        // 1. Build
        transition({ type: 'START_BUILD', context });
        const xdr = await options.buildTx(variables);
        transition({ type: 'BUILD_SUCCESS' });

        // 2. Sign
        transition({ type: 'AWAIT_SIGNATURE' });
        const signedXdr = await options.signTx(xdr);
        transition({ type: 'SIGNATURE_SUCCESS' });

        // 3. Submit
        transition({ type: 'SUBMIT' });
        const { hash } = await options.submitTx(signedXdr);
        transition({ type: 'SUBMIT_SUCCESS', txHash: hash });

        // 4. Confirm
        transition({ type: 'CONFIRM' });
        const confirmed = await options.confirmTx(hash);
        
        if (!confirmed) {
          throw new Error('Transaction confirmation timeout');
        }

        transition({ type: 'CONFIRM_SUCCESS' });
        options.onSuccess?.(hash as TData, variables);

        return hash;
      } catch (error) {
        transition({ type: 'ERROR', error });
        options.onError?.(error as Error, variables);
        throw error;
      }
    },
    [canSubmit, transition, options]
  );

  const retry = useCallback(() => {
    transition({ type: 'RETRY' });
  }, [transition]);

  const reset = useCallback(() => {
    transition({ type: 'RESET' });
  }, [transition]);

  return {
    mutate,
    retry,
    reset,
    lifecycle,
    isProcessing,
    canSubmit,
  };
}