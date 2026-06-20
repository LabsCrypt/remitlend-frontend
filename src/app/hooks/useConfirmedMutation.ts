'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useContractMutation } from './useContractMutation';
import { useConfirmation } from './useConfirmation'; // Existing hook

interface ConfirmedMutationOptions<TData, TVariables> {
  operation: string;
  buildTx: (variables: TVariables) => Promise<string>;
  signTx: (xdr: string) => Promise<string>;
  submitTx: (signedXdr: string) => Promise<{ hash: string }>;
  queryKeys: string[]; // Queries to invalidate on success
  onSuccess?: (data: TData, variables: TVariables) => void;
}

export function useConfirmedMutation<TData = unknown, TVariables = unknown>(
  options: ConfirmedMutationOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();
  const { confirm } = useConfirmation(); // Existing confirmation hook

  const mutation = useContractMutation({
    ...options,
    confirmTx: async (hash: string) => {
      // Use existing confirmation hook with unified timeout
      return confirm(hash, { timeout: 30000, pollingInterval: 2000 });
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      options.queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      options.onSuccess?.(data, variables);
    },
  });

  return mutation;
}