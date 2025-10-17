import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Counter } from '../src/Counter';

it('increments on click', async () => {
  render(<Counter />);
  await userEvent.click(screen.getByRole('button', { name: /add/i }));
  expect(screen.getByRole('heading', { name: /count:\s*1/i })).toBeInTheDocument();
});