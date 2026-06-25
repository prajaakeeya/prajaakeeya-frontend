// UNIT TEST for useExtractionPolling hook.
// Verifies API polling, onUpdate callback, error handling, and cleanup.

import { renderHook, act } from '@testing-library/react';
import useExtractionPolling from '../hooks/useExtractionPolling';
import apiClient from '../services/apiClient';

// Mock the apiClient module
vi.mock('../services/apiClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('useExtractionPolling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Always restore real timers to avoid affecting other tests
    vi.useRealTimers();
  });

  it('starts polling after mounting and calls apiClient.get after 5 seconds', async () => {
    vi.useFakeTimers();
    const mockOnUpdate = vi.fn();
    const mockResponseData = { summary: 'test' };
    (apiClient as any).get.mockResolvedValue({ data: mockResponseData });

    const { unmount } = renderHook(() => useExtractionPolling(mockOnUpdate));

    // Initially no API calls
    expect((apiClient as any).get).not.toHaveBeenCalled();

    // Advance time by 5000ms to trigger the first poll
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    // Wait for the async API call to resolve
    await Promise.resolve();

    expect((apiClient as any).get).toHaveBeenCalledTimes(1);
    expect((apiClient as any).get).toHaveBeenCalledWith('/admin/dashboard');
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).toHaveBeenCalledWith(mockResponseData);

    // Cleanup
    unmount();
  });

  it('logs a warning and does not call onUpdate when the API call fails', async () => {
    vi.useFakeTimers();
    const mockOnUpdate = vi.fn();
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    (apiClient as any).get.mockRejectedValue(new Error('Network failure'));

    renderHook(() => useExtractionPolling(mockOnUpdate));

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    await Promise.resolve();

    expect((apiClient as any).get).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[useExtractionPolling] poll failed',
      expect.any(Error)
    );

    consoleWarnSpy.mockRestore();
  });

  it('stops polling after unmount and does not make additional calls', async () => {
    vi.useFakeTimers();
    const mockOnUpdate = vi.fn();
    (apiClient as any).get.mockResolvedValue({ data: { value: 1 } });

    const { unmount } = renderHook(() => useExtractionPolling(mockOnUpdate));

    // First poll
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    await Promise.resolve();
    expect((apiClient as any).get).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);

    // Unmount the hook
    unmount();

    // Advance time further - should not trigger more API calls
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    await Promise.resolve();

    expect((apiClient as any).get).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
  });

  it('handles a slow API response and still calls onUpdate', async () => {
    vi.useFakeTimers();
    const mockOnUpdate = vi.fn();
    // Create a promise that resolves after a real microtask
    let resolveData: (value: unknown) => void;
    const dataPromise = new Promise((resolve) => {
      resolveData = resolve;
    });
    (apiClient as any).get.mockReturnValue(
      dataPromise.then(() => ({ data: { delayed: true } }))
    );

    renderHook(() => useExtractionPolling(mockOnUpdate));

    // Trigger the poll
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    // At this point the API call is pending, onUpdate not yet called
    expect((apiClient as any).get).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).not.toHaveBeenCalled();

    // Resolve the promise
    await act(async () => {
      resolveData!({});
    });
    await Promise.resolve();

    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).toHaveBeenCalledWith({ delayed: true });
  });
});
