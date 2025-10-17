# DOM/组件测试（Testing Library）

理念：
- 像用户一样使用组件（通过文本、label、role 查询）
- 少关心实现细节（state/内部函数）

基础用法：
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "./Counter";

it("increments on click", async () => {
  render(<Counter />);
  await userEvent.click(screen.getByRole("button", { name: /add/i }));
  expect(screen.getByText(/count:\s*1/i)).toBeInTheDocument();
});
```

常用查询：
- getByText/getByRole/getByLabelText
- queryBy...（可能不存在）
- findBy...（异步）

可访问性优先：
- 优先 role/labelText，退而求其次 text/testid

避免的做法：
- 不直接断言 className/DOM 结构（除非样式语义）
- 不访问组件私有方法

可访问性（a11y）实践：
- 优先使用 getByRole/getByLabelText/findByRole 等语义化查询，确保组件有可访问的角色与名称
- 使用 jest-axe 做可访问性校验（常见对比度/ARIA 标注/可聚焦性等）
```ts
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('has no a11y violations', async () => {
  const { container } = render(<Form />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

复杂交互（user-event）：
- user-event 模拟真实用户行为：点击、键盘输入、剪贴板、指针事件、组合键
- 交互是异步的：优先在事件后 await，以等待 DOM 更新完成
```tsx
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

it('handles typing and submit', async () => {
  render(<Login />);
  await userEvent.type(screen.getByLabelText(/username/i), 'neo');
  await userEvent.type(screen.getByLabelText(/password/i), 'matrix');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  expect(screen.getByText(/welcome,\s*neo/i)).toBeInTheDocument();
});
```

状态同步与断言时机：
- React：Testing Library 已封装 act；对并发/异步更新（如 useTransition）用 findBy/waitFor 断言稳定状态
- Vue：对响应式更新使用 await nextTick 或 findBy* 等异步查询
```ts
// React
await screen.findByText(/loaded/i); // 等待异步渲染完成
// Vue
import { nextTick } from 'vue';
await nextTick();
expect(screen.getByText(/loaded/i)).toBeInTheDocument();
```

容器与边界策略（Providers/路由/状态）：
- 在测试中提供最小必要的边界：主题/国际化/路由/状态管理 Provider
- 对路由与网络建议使用 MSW 与内存路由，以减少实现耦合
```tsx
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';

render(
  <MemoryRouter initialEntries={['/profile']}>
    <App />
  </MemoryRouter>
);
```
- 对全局状态（Redux/Pinia），注入测试用 store 或使用轻量的 fake store，仅暴露被测行为

快照的使用边界与替代：
- 避免对大 DOM 做整体快照（脆弱且难读）；优先行为断言与精确选择器
- 如果需要快照，倾向最小化的 inline snapshot 或关键片段（如渲染文本/属性）
```ts
// 替代断言示例：而非 expect(container).toMatchSnapshot()
expect(screen.getByRole('heading', { name: /profile/i })).toBeVisible();
expect(screen.getByRole('img', { name: /avatar/i })).toHaveAttribute('alt', 'avatar');
```

缺失断言与反模式纠正：
- 断言“被调用次数”不等于验证行为：更应断言产生的可观察 UI 或输出
- 不要查询实现细节（data-内部类名）；如必须断言样式，用 toHaveStyle 断言语义化样式
```ts
expect(screen.getByRole('button')).toHaveStyle({ cursor: 'not-allowed' });
```