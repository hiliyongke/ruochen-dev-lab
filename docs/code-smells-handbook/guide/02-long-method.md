# 2. 过长函数 (Long Method)

过长函数是指函数体过于庞大，包含了过多的逻辑和职责。

## 问题定义

当一个函数承担了过多的职责，代码行数过多（通常超过20-30行），就出现了过长函数的坏味道。这种函数难以理解、测试和维护。

## 典型症状

1. **代码行数过多**：函数体超过合理长度
2. **嵌套层次深**：多层if/for嵌套
3. **注释分段**：需要用注释来划分不同功能区块
4. **参数过多**：需要大量参数来支持复杂逻辑
5. **难以测试**：测试用例复杂，覆盖困难

## 重构方法

### 1. 提取函数 (Extract Function)
将函数中的逻辑块提取为独立的子函数。

### 2. 替换临时变量为查询 (Replace Temp with Query)
将复杂的临时变量计算提取为查询函数。

### 3. 引入参数对象 (Introduce Parameter Object)
将相关的参数组合为参数对象。

### 4. 以查询取代临时变量 (Replace Temp with Query)
消除复杂的临时变量计算。

### 5. 分解条件表达式 (Decompose Conditional)
将复杂的条件判断提取为独立函数。

## 实际案例

### 重构前代码

```javascript
function processOrder(order, user, paymentMethod, shippingAddress) {
  // 验证订单数据（15行）
  if (!order || !order.items || order.items.length === 0) {
    throw new Error('订单不能为空');
  }
  
  if (!user || !user.id) {
    throw new Error('用户信息无效');
  }
  
  if (!paymentMethod || !paymentMethod.valid) {
    throw new Error('支付方式无效');
  }
  
  if (!shippingAddress || !shippingAddress.valid) {
    throw new Error('配送地址无效');
  }
  
  // 计算价格（20行）
  let subtotal = 0;
  let tax = 0;
  let discount = 0;
  
  for (const item of order.items) {
    subtotal += item.price * item.quantity;
    
    // 计算税费
    if (item.taxable) {
      tax += item.price * item.quantity * 0.1;
    }
    
    // 应用折扣
    if (item.discount) {
      discount += item.price * item.quantity * item.discount;
    }
  }
  
  const total = subtotal + tax - discount;
  
  // 处理支付（25行）
  let paymentResult;
  try {
    paymentResult = paymentProcessor.process({
      amount: total,
      method: paymentMethod,
      user: user
    });
  } catch (error) {
    throw new Error(`支付处理失败: ${error.message}`);
  }
  
  if (!paymentResult.success) {
    throw new Error(`支付失败: ${paymentResult.message}`);
  }
  
  // 创建订单记录（15行）
  const orderRecord = {
    id: generateOrderId(),
    userId: user.id,
    items: order.items,
    total: total,
    status: 'paid',
    paymentId: paymentResult.id,
    shippingAddress: shippingAddress,
    createdAt: new Date()
  };
  
  // 保存到数据库
  database.orders.save(orderRecord);
  
  // 发送通知（10行）
  emailService.sendOrderConfirmation(user.email, orderRecord);
  smsService.sendOrderNotification(user.phone, orderRecord);
  
  return orderRecord;
}
```

### 重构后代码

```javascript
function processOrder(order, user, paymentMethod, shippingAddress) {
  // 提取验证逻辑
  validateOrderData(order, user, paymentMethod, shippingAddress);
  
  // 提取价格计算
  const pricing = calculateOrderPricing(order);
  
  // 提取支付处理
  const paymentResult = processPayment(pricing.total, paymentMethod, user);
  
  // 提取订单创建
  const orderRecord = createOrderRecord(order, user, pricing, paymentResult, shippingAddress);
  
  // 提取通知发送
  sendOrderNotifications(user, orderRecord);
  
  return orderRecord;
}

// 提取的验证函数
function validateOrderData(order, user, paymentMethod, shippingAddress) {
  if (!order || !order.items || order.items.length === 0) {
    throw new Error('订单不能为空');
  }
  
  if (!user || !user.id) {
    throw new Error('用户信息无效');
  }
  
  if (!paymentMethod || !paymentMethod.valid) {
    throw new Error('支付方式无效');
  }
  
  if (!shippingAddress || !shippingAddress.valid) {
    throw new Error('配送地址无效');
  }
}

// 提取的价格计算函数
function calculateOrderPricing(order) {
  let subtotal = 0;
  let tax = 0;
  let discount = 0;
  
  for (const item of order.items) {
    subtotal += item.price * item.quantity;
    
    if (item.taxable) {
      tax += item.price * item.quantity * 0.1;
    }
    
    if (item.discount) {
      discount += item.price * item.quantity * item.discount;
    }
  }
  
  const total = subtotal + tax - discount;
  
  return { subtotal, tax, discount, total };
}

// 提取的支付处理函数
function processPayment(amount, paymentMethod, user) {
  try {
    const paymentResult = paymentProcessor.process({
      amount: amount,
      method: paymentMethod,
      user: user
    });
    
    if (!paymentResult.success) {
      throw new Error(`支付失败: ${paymentResult.message}`);
    }
    
    return paymentResult;
  } catch (error) {
    throw new Error(`支付处理失败: ${error.message}`);
  }
}

// 提取的订单创建函数
function createOrderRecord(order, user, pricing, paymentResult, shippingAddress) {
  const orderRecord = {
    id: generateOrderId(),
    userId: user.id,
    items: order.items,
    ...pricing,
    status: 'paid',
    paymentId: paymentResult.id,
    shippingAddress: shippingAddress,
    createdAt: new Date()
  };
  
  database.orders.save(orderRecord);
  return orderRecord;
}

// 提取的通知发送函数
function sendOrderNotifications(user, orderRecord) {
  emailService.sendOrderConfirmation(user.email, orderRecord);
  smsService.sendOrderNotification(user.phone, orderRecord);
}
```

## 课后练习

1. **函数分析**：找出你项目中最长的3个函数
2. **职责划分**：分析每个函数承担的职责数量
3. **提取重构**：将过长的函数拆分为多个小函数
4. **命名优化**：为提取的函数选择清晰的名称

**练习代码**：
```javascript
// 重构以下过长函数
function handleUserRegistration(userData, preferences, referralCode) {
  // 验证用户数据（需要提取）
  if (!userData.email || !userData.password) {
    throw new Error('邮箱和密码必填');
  }
  
  if (userData.password.length < 8) {
    throw new Error('密码至少8位');
  }
  
  // 处理推荐码（需要提取）
  let referralBonus = 0;
  if (referralCode) {
    const referrer = await findUserByReferralCode(referralCode);
    if (referrer) {
      referralBonus = 10;
      await updateUserCredit(referrer.id, 5);
    }
  }
  
  // 创建用户记录（需要提取）
  const user = {
    id: generateUserId(),
    email: userData.email,
    password: hashPassword(userData.password),
    preferences: preferences || {},
    credit: referralBonus,
    createdAt: new Date()
  };
  
  await database.users.save(user);
  
  // 发送欢迎邮件（需要提取）
  await emailService.sendWelcomeEmail(user.email, user.id);
  
  // 记录注册事件（需要提取）
  await analytics.track('user_registered', {
    userId: user.id,
    referralCode: referralCode,
    timestamp: new Date()
  });
  
  return user;
}