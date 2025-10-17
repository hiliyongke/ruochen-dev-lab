# 1. 重复代码 (Duplicate Code)

重复代码是最常见也是最容易识别的代码坏味道之一。

## 问题定义

重复代码指的是在代码库的多个地方出现了相同或相似的代码片段。这些重复可能出现在同一个文件的不同位置，也可能分布在不同的文件或模块中。

## 典型症状

1. **代码复制粘贴**：明显的复制粘贴痕迹
2. **相似逻辑**：功能相似但实现略有不同的代码
3. **修改困难**：修复一个bug需要在多个地方修改
4. **维护成本高**：相同的逻辑需要多次测试和验证

## 重构方法

### 1. 提取函数 (Extract Function)
将重复的代码提取为独立的函数。

### 2. 提取类 (Extract Class)
如果重复代码涉及多个相关操作，可以提取为专门的类。

### 3. 模板方法模式 (Template Method Pattern)
对于相似的算法流程，使用模板方法模式。

### 4. 策略模式 (Strategy Pattern)
对于可替换的算法，使用策略模式。

## 实际案例

### 重构前代码

```javascript
// 在订单处理模块中
function processOrder(order) {
  // 验证订单
  if (!order.id || !order.items || order.items.length === 0) {
    throw new Error('无效订单');
  }
  
  // 计算总价（重复逻辑）
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
  }
  
  // 处理订单逻辑...
}

// 在购物车模块中  
function calculateCartTotal(cart) {
  // 验证购物车
  if (!cart.items || cart.items.length === 0) {
    return 0;
  }
  
  // 计算总价（重复逻辑）
  let total = 0;
  for (const item of cart.items) {
    total += item.price * item.quantity;
  }
  
  return total;
}
```

### 重构后代码

```javascript
// 提取公共计算函数
function calculateTotal(items) {
  if (!items || items.length === 0) {
    return 0;
  }
  
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

// 验证函数
function validateItems(items) {
  return items && items.length > 0;
}

// 重构后的订单处理
function processOrder(order) {
  if (!order.id || !validateItems(order.items)) {
    throw new Error('无效订单');
  }
  
  const total = calculateTotal(order.items);
  // 处理订单逻辑...
}

// 重构后的购物车计算
function calculateCartTotal(cart) {
  if (!validateItems(cart.items)) {
    return 0;
  }
  
  return calculateTotal(cart.items);
}
```

## 课后练习

1. **识别重复**：在你的项目中找出3处重复代码
2. **提取函数**：将重复代码提取为可重用的函数
3. **参数化**：使提取的函数能够处理不同的场景
4. **测试验证**：确保重构后的功能正确性

**练习代码**：
```javascript
// 找出以下代码中的重复并重构
function formatUserInfo(user) {
  let result = '';
  if (user.firstName) {
    result += user.firstName;
  }
  if (user.lastName) {
    if (result) result += ' ';
    result += user.lastName;
  }
  return result;
}

function formatProductInfo(product) {
  let result = '';
  if (product.name) {
    result += product.name;
  }
  if (product.brand) {
    if (result) result += ' - ';
    result += product.brand;
  }
  return result;
}