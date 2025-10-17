import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';

import App from '../src/app/App.vue';
import { createTestRouter } from '../src/app/router';

describe('Vue Router + provide/inject state', () => {
  it('navigates and preserves state', async () => {
    const router = createTestRouter();
    render(App, { global: { plugins: [router] } });
    await router.isReady();

    // 初始 Home
    expect(screen.getByRole('heading', { name: /home count:\s*0/i })).toBeInTheDocument();

    // 增加计数并跳转到 About
    await userEvent.click(screen.getByRole('button', { name: /inc/i }));
    await userEvent.click(screen.getByRole('link', { name: /about/i }));

    // 在 About 页面验证状态持久
    expect(screen.getByRole('heading', { name: /about count:\s*1/i })).toBeInTheDocument();
  });
});