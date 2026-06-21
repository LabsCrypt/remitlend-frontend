import { mapTransactionError, isRetryableError, getErrorDisplay } from '../transactionErrors';

describe('transactionErrors', () => {
  it('maps user rejection', () => {
    const error = mapTransactionError(new Error('User declined transaction'));
    expect(error.code).toBe('USER_REJECTED');
    expect(error.retryable).toBe(true);
    expect(error.actionable).toContain('approve');
  });

  it('maps insufficient fee', () => {
    const error = mapTransactionError(new Error('tx_insufficient_fee'));
    expect(error.code).toBe('INSUFFICIENT_FEE');
    expect(error.actionable).toContain('XLM');
  });

  it('maps timeout', () => {
    const error = mapTransactionError(new Error('Transaction timeout'));
    expect(error.code).toBe('TIMEOUT');
  });

  it('maps sequence mismatch', () => {
    const error = mapTransactionError(new Error('bad_seq'));
    expect(error.code).toBe('SEQUENCE_MISMATCH');
    expect(error.actionable).toContain('refresh');
  });

  it('maps contract error', () => {
    const error = mapTransactionError(new Error('invoke_host_function error'));
    expect(error.code).toBe('CONTRACT_ERROR');
    expect(error.retryable).toBe(false);
  });

  it('falls back to unknown for unmapped errors', () => {
    const error = mapTransactionError(new Error('Something weird'));
    expect(error.code).toBe('UNKNOWN');
    expect(error.retryable).toBe(true);
  });

  it('provides display format', () => {
    const error = mapTransactionError(new Error('User declined'));
    const display = getErrorDisplay(error);
    expect(display.title).toBe('USER REJECTED');
    expect(display.canRetry).toBe(true);
  });
});