import { renderHook, act } from '@testing-library/react';
import { useTransactionLifecycle } from '../useTransactionLifecycle';

describe('useTransactionLifecycle', () => {
  it('starts in idle state', () => {
    const { result } = renderHook(() => useTransactionLifecycle());
    expect(result.current.lifecycle.state).toBe('idle');
    expect(result.current.canSubmit).toBe(true);
    expect(result.current.isProcessing).toBe(false);
  });

  it('transitions through full success flow', async () => {
    const { result } = renderHook(() => useTransactionLifecycle());

    act(() => {
      result.current.transition({ 
        type: 'START_BUILD', 
        context: { operation: 'test' } 
      });
    });
    expect(result.current.lifecycle.state).toBe('building');

    act(() => result.current.transition({ type: 'BUILD_SUCCESS' }));
    expect(result.current.lifecycle.state).toBe('awaiting-signature');

    act(() => result.current.transition({ type: 'SIGNATURE_SUCCESS' }));
    expect(result.current.lifecycle.state).toBe('submitting');

    act(() => result.current.transition({ type: 'SUBMIT_SUCCESS', txHash: 'abc123' }));
    expect(result.current.lifecycle.state).toBe('confirming');
    expect(result.current.lifecycle.txHash).toBe('abc123');

    act(() => result.current.transition({ type: 'CONFIRM_SUCCESS' }));
    expect(result.current.lifecycle.state).toBe('success');
    expect(result.current.isSuccess).toBe(true);
  });

  it('prevents double-submit via idempotency lock', () => {
    const { result } = renderHook(() => useTransactionLifecycle());

    act(() => {
      result.current.transition({ 
        type: 'START_BUILD', 
        context: { operation: 'test' } 
      });
    });
    act(() => result.current.transition({ type: 'BUILD_SUCCESS' }));
    act(() => result.current.transition({ type: 'SIGNATURE_SUCCESS' }));
    act(() => result.current.transition({ type: 'SUBMIT' }));

    // Second submit should be ignored
    act(() => result.current.transition({ type: 'SUBMIT' }));
    expect(result.current.lifecycle.state).toBe('submitting');
  });

  it('handles errors and allows retry', () => {
    const { result } = renderHook(() => useTransactionLifecycle());

    act(() => {
      result.current.transition({ 
        type: 'START_BUILD', 
        context: { operation: 'test' } 
      });
    });
    act(() => result.current.transition({ 
      type: 'ERROR', 
      error: new Error('User declined') 
    }));

    expect(result.current.lifecycle.state).toBe('error');
    expect(result.current.lifecycle.error?.code).toBe('USER_REJECTED');
    expect(result.current.lifecycle.error?.retryable).toBe(true);

    act(() => result.current.transition({ type: 'RETRY' }));
    expect(result.current.lifecycle.state).toBe('building');
    expect(result.current.lifecycle.error).toBeNull();
  });

  it('maps contract errors as non-retryable', () => {
    const { result } = renderHook(() => useTransactionLifecycle());

    act(() => {
      result.current.transition({ 
        type: 'START_BUILD', 
        context: { operation: 'test' } 
      });
    });
    act(() => result.current.transition({ 
      type: 'ERROR', 
      error: new Error('invoke_host_function failed') 
    }));

    expect(result.current.lifecycle.error?.code).toBe('CONTRACT_ERROR');
    expect(result.current.lifecycle.error?.retryable).toBe(false);
  });

  it('resets to idle', () => {
    const { result } = renderHook(() => useTransactionLifecycle());

    act(() => {
      result.current.transition({ 
        type: 'START_BUILD', 
        context: { operation: 'test' } 
      });
    });
    act(() => result.current.transition({ type: 'RESET' }));

    expect(result.current.lifecycle.state).toBe('idle');
    expect(result.current.canSubmit).toBe(true);
  });
});