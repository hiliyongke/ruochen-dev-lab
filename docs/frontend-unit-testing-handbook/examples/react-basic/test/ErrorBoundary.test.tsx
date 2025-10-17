import { render, screen } from '@testing-library/react';

import { ErrorBoundary } from '../src/ErrorBoundary';
import { Broken } from '../src/Broken';

describe('ErrorBoundary', () => {
  it('renders fallback when child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {}); // 抑制 React 抛错日志
    render(
      <ErrorBoundary fallbackRender={(err) => <div role="alert">Fallback: {err.message}</div>}>
        <Broken shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/fallback: boom/i);
    spy.mockRestore();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>
    );
    expect(screen.getByRole('status')).toHaveTextContent(/ok/i);
  });
});