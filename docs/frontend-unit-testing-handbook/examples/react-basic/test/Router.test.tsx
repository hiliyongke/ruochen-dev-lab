import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppRouter } from '../src/App';

it('navigates and persists state across routes', async () => {
  render(<AppRouter />);
  // 增加一次计数
  await userEvent.click(screen.getByRole('button', { name: /inc/i }));
  expect(screen.getByRole('heading', { name: /home count:\s*1/i })).toBeInTheDocument();

  // 跳转到 Profile，验证状态持久
  await userEvent.click(screen.getByRole('link', { name: /go profile/i }));
  expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
  expect(screen.getByLabelText('count')).toHaveTextContent(/current:\s*1/i);

  // 返回 Home 验证路由可用
  await userEvent.click(screen.getByRole('link', { name: /back home/i }));
  expect(screen.getByRole('heading', { name: /home count:\s*1/i })).toBeInTheDocument();
});