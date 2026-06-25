// UNIT TEST for useSnackbar hook.
// Tests the snackbar state management: message, open flag, severity, and actions.

import { renderHook, act } from '@testing-library/react';
import useSnackbar from '../hooks/useSnackbar';

describe('useSnackbar', () => {
  it('initializes with closed state, empty message, and info severity', () => {
    const { result } = renderHook(() => useSnackbar());
    expect(result.current.open).toBe(false);
    expect(result.current.message).toBe('');
    expect(result.current.severity).toBe('info');
  });

  it('showMessage opens snackbar and sets message + severity', () => {
    const { result } = renderHook(() => useSnackbar());

    act(() => {
      result.current.showMessage('Hello world', 'success');
    });

    expect(result.current.message).toBe('Hello world');
    expect(result.current.open).toBe(true);
    expect(result.current.severity).toBe('success');
  });

  it('showMessage defaults severity to info when not provided', () => {
    const { result } = renderHook(() => useSnackbar());

    act(() => {
      result.current.showMessage('Default severity test');
    });

    expect(result.current.severity).toBe('info');
  });

  it('close sets open to false', () => {
    const { result } = renderHook(() => useSnackbar());

    act(() => {
      result.current.showMessage('Open me');
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.close();
    });
    expect(result.current.open).toBe(false);
  });

  it('retains message when only closing', () => {
    const { result } = renderHook(() => useSnackbar());

    act(() => {
      result.current.showMessage('Keep me');
    });
    expect(result.current.message).toBe('Keep me');

    act(() => {
      result.current.close();
    });
    // message should persist after close
    expect(result.current.message).toBe('Keep me');
  });

  it('multiple showMessage calls update state correctly', () => {
    const { result } = renderHook(() => useSnackbar());

    act(() => {
      result.current.showMessage('First message', 'info');
    });
    expect(result.current.message).toBe('First message');
    expect(result.current.severity).toBe('info');

    act(() => {
      result.current.showMessage('Second message', 'error');
    });
    expect(result.current.message).toBe('Second message');
    expect(result.current.severity).toBe('error');
    expect(result.current.open).toBe(true);
  });
});
