# 第10章 可访问性（a11y）与国际化（i18n）

## 导读与学习目标
本章聚焦两个工程能力：可访问性与国际化。你将学会：
- 基于语义化与 ARIA 的组件可访问化改造（键盘可达、焦点管理、朗读）
- 在 React 中实现国际化基础架构（文案抽取、上下文提供、动态切换、占位符格式化）
- 结合第7章性能与第3章组合思想，保证可维护性与可测试性

阅读前提：熟悉 JSX、Hooks、Context；有 Tailwind 基础更佳。
预计用时：60–90 分钟。

---

## 10.1 为什么必须重视 a11y 与 i18n
- a11y：法律合规、无障碍体验、产品口碑；从按钮到列表、对话框均需键盘与朗读友好
- i18n：支持多语与本地化（日期、数字、货币、复数）；与产品增长直接相关

---

## 10.2 a11y 基础：语义化优先，ARIA 补充
- 语义化标签：button、nav、main、ul/li 等
- 键盘可达：Tab 顺序、Enter/Space 触发、Arrow 导航、Esc 关闭
- 焦点管理：开关浮层后将焦点移入，关闭时回到触发点
- ARIA：
  - role：为非语义元素提供辅助角色
  - aria-pressed/selected/expanded 等状态属性
  - aria-controls/aria-labelledby/aria-describedby 建立关系

---

## 10.3 实战：键盘友好的简易 Select
目标：
- 上下方向键切换项目，Enter 选中，Esc 关闭
- 正确的 role、aria-activedescendant、aria-expanded 等
要点：
- 以按钮作为触发器，列表用 role="listbox"，选项用 role="option"
- 使用 id+aria-activedescendant 标注当前高亮项
- 打开列表后 focus 到选项容器；关闭后 focus 回触发按钮

详见示例 A11yDemo。

---

## 10.4 i18n 基础架构：Context + 资源表
- 资源结构：const messages = { zh: { key: "文案 {name}" }, en: { key: "Text {name}" } }
- I18nContext 提供当前语言与切换方法；useI18n 提供 t(key, params)
- 插值与复数：最简实现可通过简单替换与条件判断；复杂需求可引入 ICU 格式化库（后续可演进）

---

## 10.5 实战：无第三方库的轻量 i18n
目标：
- 支持中英文切换
- t("greet", { name: "Ada" }) 占位符替换
- 简易复数：count=1 与其他情况不同文本

详见示例 I18nDemo。

---

## 10.6 工程与测试
- a11y 测试：React Testing Library 配合 axe 或手工断言 role/name 可读性
- i18n 测试：基于快照与参数化测试，确保不同语言资源齐备
- 文案抽取：统一放置到 messages 目录；避免组件内硬编码文案

---

## 本章小结
- a11y 以语义优先、ARIA 补充；键盘与焦点管理是关键
- i18n 架构以 Context+资源表起步，支持插值与复数，后续可演进到 ICU/格式化库
- 与性能和组合思想结合，保持结构清晰、可测试、易演进

---

## 练习题
1. 为一个对话框组件补齐：打开时焦点环内循环、Esc 关闭、aria-labelledby/aria-describedby 关联
2. 在 I18nDemo 中新增“产品数”复数文案，并补充单测
3. 将项目中的按钮组件统一添加 aria-pressed 与键盘交互（Space/Enter）支持

---

## 延伸阅读
- WAI-ARIA Authoring Practices
- MDN：ARIA roles, states, and properties
- React Intl / FormatJS 文档
- WCAG 2.2 摘要与检查清单