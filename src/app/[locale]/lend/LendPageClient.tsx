'use client';

import { useState } from 'react';
import { useConfirmedMutation } from '@/app/hooks/useConfirmedMutation';
import { TransactionStatus } from '@/app/components/transaction/TransactionStatus';
import { Button } from '@/app/components/global_ui/Button';
import { Input } from '@/app/components/global_ui/Input';

export function LendPageClient() {
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit');

  const depositMutation = useConfirmedMutation({
    operation: 'lend_deposit',
    buildTx: async (vars: { amount: string }) => {
      const res = await fetch('/api/pool/build-deposit', {
        method: 'POST',
        body: JSON.stringify({ amount: vars.amount }),
      });
      return (await res.json()).xdr;
    },
    signTx: async (xdr) => {
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
      return { hash: (await res.json()).hash };
    },
    queryKeys: ['pool-balance', 'user-deposits', 'pool-stats'],
  });

  const withdrawMutation = useConfirmedMutation({
    operation: 'lend_withdraw',
    buildTx: async (vars: { amount: string }) => {
      const res = await fetch('/api/pool/build-withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount: vars.amount }),
      });
      return (await res.json()).xdr;
    },
    signTx: async (xdr) => {
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
      return { hash: (await res.json()).hash };
    },
    queryKeys: ['pool-balance', 'user-deposits', 'pool-stats'],
  });

  const activeMutation = action === 'deposit' ? depositMutation : withdrawMutation;

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    activeMutation.mutate({ amount });
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Lending Pool</h1>
      
      <div className="flex gap-2">
        <Button 
          variant={action === 'deposit' ? 'primary' : 'secondary'}
          onClick={() => setAction('deposit')}
        >
          Deposit
        </Button>
        <Button 
          variant={action === 'withdraw' ? 'primary' : 'secondary'}
          onClick={() => setAction('withdraw')}
        >
          Withdraw
        </Button>
      </div>

      <Input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={activeMutation.isProcessing}
      />

      <TransactionStatus
        lifecycle={activeMutation.lifecycle}
        onRetry={activeMutation.retry}
        onReset={activeMutation.reset}
      />

      {activeMutation.canSubmit && (
        <Button 
          onClick={handleSubmit}
          disabled={!amount || activeMutation.isProcessing}
          className="w-full"
        >
          {action === 'deposit' ? 'Deposit' : 'Withdraw'}
        </Button>
      )}
    </div>
  );
}