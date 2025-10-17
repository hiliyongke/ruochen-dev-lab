import { render, screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { AppRouter } from '../src/App';

// 可选：使用 jest-axe 做基础扫描；为了避免全局污染，在测试内动态引入并拓展 matcher
async function runAxeCheck(container: HTMLElement) {
  const { axe, toHaveNoViolations } = await import('jest-axe');
  expect.extend(toHaveNoViolations as any);
  const results = await axe(container, {
    rules: {
      // 示例：在简单示例中关闭某些冗余规则
    },
  });
  expect(results).toHaveNoViolations();
}

describe('A11y', () => {
  it('has proper roles and accessible names; passes basic axe audit', async () => {
    const { container } = render(<AppRouter />);

    // 角色/名称检查
    const heading = screen.getByRole('heading', { name: /home count:\s*0/i });
    const incBtn = screen.getByRole('button', { name: /inc/i });
    const goProfile = screen.getByRole('link', { name: /go profile/i });
    expect(heading).toBeInTheDocument();
    expect(incBtn).toBeInTheDocument();
    expect(goProfile).toBeInTheDocument();

    // 交互后依旧符合语义
    await userEvent.click(incBtn);
    expect(screen.getByRole('heading', { name: /home count:\s*1/i })).toBeInTheDocument();

    // 基础 axe 扫描
    await runAxeCheck(container);
  });
});