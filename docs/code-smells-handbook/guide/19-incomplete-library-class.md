# 19. 不完整的库类 (Incomplete Library Class)

不完整的库类是指第三方库或框架提供的类功能不完整，无法满足特定需求。

## 问题定义

当使用第三方库或框架时，发现其提供的类功能不完整，无法直接满足业务需求，但又不能修改库代码时，就出现了不完整的库类坏味道。这种情况需要在不修改库代码的前提下扩展功能。

## 典型症状

1. **功能缺失**：库类缺少必要的功能
2. **无法修改**：不能直接修改库代码
3. **扩展困难**：库类设计不利于扩展
4. **兼容性问题**：直接修改会影响库的更新
5. **维护成本**：需要维护自定义的扩展代码

## 重构方法

### 1. 引入本地扩展 (Introduce Local Extension)
创建子类或包装类来扩展功能。

### 2. 用委托替代继承 (Replace Inheritance with Delegation)
使用委托关系来扩展功能。

### 3. 提取方法对象 (Extract Method Object)
将复杂逻辑提取为方法对象。

### 4. 用策略模式替代条件表达式 (Replace Conditional with Strategy)
用策略模式处理不同的扩展场景。

### 5. 使用组合模式 (Use Composition)
通过组合来扩展功能。

## 实际案例

### 重构前代码

```javascript
// 不完整的库类典型例子 - 假设这是第三方日期库

// 第三方日期库（假设功能不完整）
class ThirdPartyDate {
  constructor(year, month, day) {
    this.year = year;
    this.month = month;
    this.day = day;
  }
  
  // 基本功能
  toString() {
    return `${this.year}-${this.month.toString().padStart(2, '0')}-${this.day.toString().padStart(2, '0')}`;
  }
  
  // 缺少业务需要的功能
  // - 没有节假日判断
  // - 没有工作日计算
  // - 没有日期格式化选项
  // - 没有时区支持
  // - 没有日期运算
}

// 业务代码中直接使用不完整的库类
class BusinessDateCalculator {
  constructor() {
    this.holidays = [
      '2024-01-01', // 元旦
      '2024-02-10', // 春节
      '2024-04-04', // 清明节
      '2024-05-01', // 劳动节
      '2024-06-10', // 端午节
      '2024-09-17', // 中秋节
      '2024-10-01'  // 国庆节
    ];
  }
  
  // 业务需要的功能，但库类不提供
  isHoliday(date) {
    const dateStr = date.toString();
    return this.holidays.includes(dateStr);
  }
  
  isWeekend(date) {
    // 库类没有提供获取星期几的功能
    // 需要自己实现
    const tempDate = new Date(date.year, date.month - 1, date.day);
    const dayOfWeek = tempDate.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }
  
  isBusinessDay(date) {
    return !this.isHoliday(date) && !this.isWeekend(date);
  }
  
  addBusinessDays(startDate, days) {
    let currentDate = startDate;
    let businessDaysAdded = 0;
    
    while (businessDaysAdded < days) {
      // 需要创建新的日期对象
      const nextDate = this.addDays(currentDate, 1);
      currentDate = new ThirdPartyDate(nextDate.year, nextDate.month, nextDate.day);
      
      if (this.isBusinessDay(currentDate)) {
        businessDaysAdded++;
      }
    }
    
    return currentDate;
  }
  
  addDays(date, days) {
    // 库类没有提供日期运算功能
    const jsDate = new Date(date.year, date.month - 1, date.day);
    jsDate.setDate(jsDate.getDate() + days);
    
    return new ThirdPartyDate(
      jsDate.getFullYear(),
      jsDate.getMonth() + 1,
      jsDate.getDate()
    );
  }
}
```

### 重构后代码（引入适配层）

```javascript
// path: src/date/DateAdapter.js
class DateAdapter {
  constructor(year, month, day) {
    this._d = new Date(year, month - 1, day);
  }
  static fromThirdParty(third) {
    return new DateAdapter(third.year, third.month, third.day);
  }
  toThirdParty() {
    return { year: this.year(), month: this.month(), day: this.day() };
  }
  year() { return this._d.getFullYear(); }
  month() { return this._d.getMonth() + 1; }
  day() { return this._d.getDate(); }
  isWeekend() {
    const w = this._d.getDay();
    return w === 0 || w === 6;
  }
  addDays(n) {
    const d = new Date(this._d);
    d.setDate(d.getDate() + n);
    return new DateAdapter(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }
  toString() {
    const mm = String(this.month()).padStart(2, '0');
    const dd = String(this.day()).padStart(2, '0');
    return `${this.year()}-${mm}-${dd}`;
  }
}

// 使用适配层替换直接依赖第三方类型
class BusinessCalendar {
  constructor(holidays) {
    this.holidays = new Set(holidays);
  }
  isHoliday(adapter) {
    return this.holidays.has(adapter.toString());
  }
  isBusinessDay(adapter) {
    return !this.isHoliday(adapter) && !adapter.isWeekend();
  }
  addBusinessDays(start, days) {
    let cur = start;
    let added = 0;
    while (added < days) {
      cur = cur.addDays(1);
      if (this.isBusinessDay(cur)) added++;
    }
    return cur;
  }
}

// 用法
const cal = new BusinessCalendar([
  '2024-01-01','2024-02-10','2024-04-04','2024-05-01','2024-06-10','2024-09-17','2024-10-01'
]);
const start = new DateAdapter(2024, 9, 30);
const end = cal.addBusinessDays(start, 3);
// console.log(end.toString());
```

## 课后练习

1) 识别并补全库类的封装边界
- 练习目标：找出直接操作第三方库内部细节的调用点，封装为自有适配器。
- 提示：先用搜索定位 new 第三方类型、访问其内部字段的代码，再将这些用法迁移到 Adapter。
- 示例（Before → After）：

Before（直接耦合第三方库实现）：
```javascript
// path: src/metrics/calcVelocity.js
import { LegacyGraph } from 'legacy-graph';

export function calcVelocity(nodes) {
  const graph = new LegacyGraph(nodes);
  // 直接访问内部结构（坏味道：不完整的库类导致外部越权）
  const edges = graph._edges; // 非公开字段
  let sum = 0;
  for (const e of edges) {
    sum += e.weight;
  }
  return sum / edges.length;
}
```

After（通过适配器扩展缺失的库能力）：
```javascript
// path: src/metrics/GraphAdapter.js
import { LegacyGraph } from 'legacy-graph';

export class GraphAdapter {
  constructor(nodes) {
    this.graph = new LegacyGraph(nodes);
  }
  // 显式提供查询方法，屏蔽内部结构
  getEdgeWeights() {
    // 使用库的公开 API 组合出所需数据，或在此处集中维护兼容逻辑
    return this.graph.listEdges().map(e => e.weight);
  }
}

// path: src/metrics/calcVelocity.js
import { GraphAdapter } from './GraphAdapter.js';

export function calcVelocity(nodes) {
  const g = new GraphAdapter(nodes);
  const weights = g.getEdgeWeights();
  const sum = weights.reduce((acc, w) => acc + w, 0);
  return sum / (weights.length || 1);
}
```

2) 用“引入扩展函数/类”改善调用可读性
- 练习目标：针对库类缺少的常用方法，编写扩展函数，并在业务侧只使用扩展函数。
- 提示：遵循“封装第三方 → 暴露最小接口 → 业务只依赖自有适配层”。

3) 编写回归测试保障重构正确性
- 练习目标：为上述适配器编写单元测试，覆盖库版本更新的关键行为。
- 示例（Jest）：
```javascript
// path: tests/GraphAdapter.test.js
import { GraphAdapter } from '../src/metrics/GraphAdapter.js';

test('getEdgeWeights returns numeric weights', () => {
  const nodes = [{ id: 1 }, { id: 2 }];
  const g = new GraphAdapter(nodes);
  const weights = g.getEdgeWeights();
  expect(Array.isArray(weights)).toBe(true);
  for (const w of weights) {
    expect(typeof w).toBe('number');
  }
});
```

4) 思考题
- 为什么“直接访问库内部字段”会导致维护风险？当库升级或重构时，有哪些可能的破坏性影响？
- 如果第三方库没有你需要的 API，你会优先选择“扩展库”还是“替换库”？请说明权衡因素。

5) 拓展练习
- 将一个常见 UI 组件库的内部样式变量访问，改为通过“主题配置/封装层”访问，避免对内部实现的硬绑定。