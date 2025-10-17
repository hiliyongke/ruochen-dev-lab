# 实战案例：从 0 给组件库补测试

背景：
- 现有通用组件库（Button/Input/Modal），线上偶发回归
- 目标：两周内把关键组件补到 80% 覆盖，建立守门

步骤：
1) 盘点风险组件：频繁变更/核心路径
2) 建立测试基线：为 Button/Input 各写 3-5 条关键行为
3) 引入 Testing Library，统一查询策略
4) 建 CI 守门：覆盖率 S=70/B=60/F=70 起步
5) 持续补齐：每个变更必须带测试

示例：Button 关键行为
- 可渲染文本/禁用态不可点击/加载态展示 spinner
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

it("disabled cannot be clicked", async () => {
  const onClick = vi.fn();
  render(<Button disabled onClick={onClick}>提交</Button>);
  await userEvent.click(screen.getByRole("button", { name: "提交" }));
  expect(onClick).not.toBeCalled();
});
```

产出：
- 用例集、覆盖率报表、落地规范一页纸
- PR 模板要求：变更点 + 对应用例