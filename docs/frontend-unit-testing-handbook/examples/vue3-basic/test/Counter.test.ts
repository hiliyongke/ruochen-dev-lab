import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';

import Counter from '../src/components/Counter.vue';

describe('Counter.vue', () => {
  it('increments on click', async () => {
    render(Counter);
    expect(screen.getByRole('heading', { name: /count:\s*0/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /increment/i }));
    expect(screen.getByRole('heading', { name: /count:\s*1/i })).toBeInTheDocument();
  });
});