'use client';

import { useConfirmedMutation } from '@/app/hooks/useConfirmedMutation';
import { TransactionStatus } from '@/app/components/transaction/TransactionStatus';
import { Button } from '@/app/components/global_ui/Button';

interface StepFinalSignatureProps {
  loanId: string;
  onComplete: () => void;
}

export function StepFinalSignature({ loanId, onComplete }: StepFinalSignatureProps) {
  const mutation = useConfirmedMutation({
    operation: 'loan_sign',
    buildTx: async () => {
      // Call backend to build loan signature transaction XDR
      const res = await fetch(`/api/loans/${loanId}/build-signature`);
      const data = await res.json();
      return data.xdr;
    },
    signTx: async (xdr) => {
      // Use Stellar Wallet Kit or Freighter
      const { signedXDR } = await window.freighterApi.signTransaction(xdr, {
        network: 'TESTNET',
      });
      return signedXDR;
    },
    submitTx: async (signedXdr) => {
      const res = await fetch('/api/transactions/submit', {
        method: 'POST',
        body: JSON.stringify({ xdr: signedXdr }),
      });
      const data = await res.json();
      return { hash: data.hash };
    },
    queryKeys: ['loan', loanId, 'loans', 'user-loans'],
    onSuccess: () => {
      onComplete();
    },
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Final Signature Required</h2>
        <p className="text-gray-600 mt-2">
          Please review and sign the loan agreement transaction.
        </p>
      </div>

      <TransactionStatus 
        lifecycle={mutation.lifecycle}
        onRetry={mutation.retry}
        onReset={mutation.reset}
      />

      {mutation.canSubmit && (
        <Button 
          onClick={() => mutation.mutate(undefined)}
          disabled={mutation.isProcessing}
          className="w-full"
        >
          Sign Loan Agreement
        </Button>
      )}
    </div>
  );
}