import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import Index from '../pages/index.vue';
import About from '../pages/about.vue';
import { createPinia, setActivePinia } from 'pinia';

describe('Nuxt + Pinia + Pages', () => {
  it('state persists across pages', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const stubs = {
      NuxtLink: { template: '<a :href="to"><slot/></a>', props: ['to'] }
    };

    // 渲染 Home 并增加计数
    render(Index, { global: { plugins: [pinia], stubs } });
    expect(screen.getByRole('heading', { name: /home count:\s*0/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /inc/i }));
    expect(screen.getByRole('heading', { name: /home count:\s*1/i })).toBeInTheDocument();

    // 渲染 About，复用同一 Pinia 实例，验证持久
    render(About, { global: { plugins: [pinia], stubs } });
    expect(screen.getByRole('heading', { name: /about count:\s*1/i })).toBeInTheDocument();
  });
});