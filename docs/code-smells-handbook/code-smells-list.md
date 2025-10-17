# 代码坏味道标准分类（24种）

根据Martin Fowler《重构》经典分类，完整的24种代码坏味道：

## 1. 重复代码 (Duplicate Code)

- 同一个代码片段在多个地方出现

## 2. 过长函数 (Long Method)

- 函数体过长，难以理解和维护

## 3. 过大的类 (Large Class)

- 类承担了太多职责

## 4. 过长参数列 (Long Parameter List)

- 函数参数过多

## 5. 发散式变化 (Divergent Change)

- 一个类因为不同原因被修改

## 6. 霰弹式修改 (Shotgun Surgery)

- 一个变化需要修改多个类

## 7. 依恋情结 (Feature Envy)

- 一个函数过度访问另一个对象的数据

## 8. 数据泥团 (Data Clumps)

- 总是绑在一起出现的数据项

## 9. 基本类型偏执 (Primitive Obsession)

- 过度使用基本类型而不是对象

## 10. Switch语句 (Switch Statements)

- 复杂的条件判断逻辑

## 11. 平行继承体系 (Parallel Inheritance Hierarchies)

- 两个继承体系一一对应

## 12. 冗余类 (Lazy Class)

- 没有足够职责的类

## 13. 夸夸其谈未来性 (Speculative Generality)

- 为未来可能的需求过度设计

## 14. 临时字段 (Temporary Field)

- 只在特定情况下使用的字段

## 15. 过度的消息链 (Message Chains)

- 过长的对象调用链

## 16. 中间人 (Middle Man)

- 类的大部分方法都是委托

## 17. 不恰当的亲密关系 (Inappropriate Intimacy)

- 类之间过度了解对方实现

## 18. 异曲同工的类 (Alternative Classes with Different Interfaces)

- 功能相似但接口不同的类

## 19. 不完美的库类 (Incomplete Library Class)

- 第三方库类不完全符合需求

## 20. 数据类 (Data Class)

- 只有字段和getter/setter的类

## 21. 被拒绝的遗赠 (Refused Bequest)

- 子类不需要父类的所有方法

## 22. 注释 (Comments)

- 过多注释表明代码需要重构

## 23. 魔法数字 (Magic Number)

- 代码中直接出现的数字常量

## 24. 循环复杂度 (Cyclomatic Complexity)

- 条件逻辑过于复杂
