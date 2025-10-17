# 10. Switch语句 (Switch Statements)

Switch语句是指过度使用switch或if-else链来处理类型判断。

## 问题定义

当代码中大量使用switch语句或长的if-else链来根据类型或状态执行不同的行为时，就出现了Switch语句的坏味道。这通常表明应该使用多态来替代条件判断。

## 典型症状

1. **长的条件链**：冗长的if-else或switch语句
2. **重复的条件判断**：相同的条件判断出现在多个地方
3. **新类型添加困难**：添加新类型需要修改多个地方
4. **违反开闭原则**：修改现有代码而不是扩展
5. **业务逻辑分散**：相关逻辑分散在多个分支中

## 重构方法

### 1. 用多态替代条件表达式 (Replace Conditional with Polymorphism)
用多态来消除条件判断。

### 2. 用策略模式替代条件表达式 (Replace Conditional with Strategy)
用策略模式来替代条件判断。

### 3. 用状态模式替代条件表达式 (Replace Conditional with State)
用状态模式来替代条件判断。

### 4. 用命令模式替代条件表达式 (Replace Conditional with Command)
用命令模式来替代条件判断。

### 5. 用映射表替代条件表达式 (Replace Conditional with Lookup Table)
用映射表来简化条件判断。

## 实际案例

### 重构前代码

```javascript
// Switch语句坏味道的典型例子
class PaymentProcessor {
  processPayment(paymentMethod, amount, paymentData) {
    // 冗长的switch语句
    switch (paymentMethod) {
      case 'credit_card':
        return this.processCreditCard(amount, paymentData);
      case 'paypal':
        return this.processPayPal(amount, paymentData);
      case 'wechat_pay':
        return this.processWeChatPay(amount, paymentData);
      case 'alipay':
        return this.processAlipay(amount, paymentData);
      case 'bank_transfer':
        return this.processBankTransfer(amount, paymentData);
      default:
        throw new Error(`不支持的支付方式: ${paymentMethod}`);
    }
  }
  
  processCreditCard(amount, paymentData) {
    const { cardNumber, expiryDate, cvv } = paymentData;
    console.log(`处理信用卡支付: ${amount}元`);
    // 复杂的信用卡处理逻辑
    return { success: true, transactionId: `CC_${Date.now()}` };
  }
  
  processPayPal(amount, paymentData) {
    const { email, password } = paymentData;
    console.log(`处理PayPal支付: ${amount}元`);
    // 复杂的PayPal处理逻辑
    return { success: true, transactionId: `PP_${Date.now()}` };
  }
  
  processWeChatPay(amount, paymentData) {
    const { openid } = paymentData;
    console.log(`处理微信支付: ${amount}元`);
    // 复杂的微信支付逻辑
    return { success: true, transactionId: `WX_${Date.now()}` };
  }
  
  processAlipay(amount, paymentData) {
    const { userId } = paymentData;
    console.log(`处理支付宝支付: ${amount}元`);
    // 复杂的支付宝逻辑
    return { success: true, transactionId: `AL_${Date.now()}` };
  }
  
  processBankTransfer(amount, paymentData) {
    const { accountNumber, bankName } = paymentData;
    console.log(`处理银行转账: ${amount}元`);
    // 复杂的银行转账逻辑
    return { success: true, transactionId: `BT_${Date.now()}` };
  }
  
  // 另一个switch语句的例子 - 计算运费
  calculateShippingCost(order, shippingMethod) {
    let cost = 0;
    
    switch (shippingMethod) {
      case 'standard':
        cost = this.calculateStandardShipping(order);
        break;
      case 'express':
        cost = this.calculateExpressShipping(order);
        break;
      case 'overnight':
        cost = this.calculateOvernightShipping(order);
        break;
      default:
        throw new Error(`不支持的配送方式: ${shippingMethod}`);
    }
    
    // 折扣计算也有条件判断
    if (order.customerType === 'vip') {
      cost *= 0.8; // VIP客户8折
    } else if (order.customerType === 'premium') {
      cost *= 0.9; // 高级客户9折
    }
    
    return cost;
  }
  
  calculateStandardShipping(order) {
    return Math.max(10, order.weight * 2);
  }
  
  calculateExpressShipping(order) {
    return Math.max(20, order.weight * 3);
  }
  
  calculateOvernightShipping(order) {
    return Math.max(50, order.weight * 5);
  }
  
  // 验证支付方式 - 更多的条件判断
  validatePaymentMethod(paymentMethod) {
    const validMethods = ['credit_card', 'paypal', 'wechat_pay', 'alipay', 'bank_transfer'];
    return validMethods.includes(paymentMethod);
  }
  
  getPaymentMethodDisplayName(paymentMethod) {
    const displayNames = {
      'credit_card': '信用卡',
      'paypal': 'PayPal',
      'wechat_pay': '微信支付',
      'alipay': '支付宝',
      'bank_transfer': '银行转账'
    };
    return displayNames[paymentMethod] || '未知支付方式';
  }
}

// 使用示例
const processor = new PaymentProcessor();

// 处理不同支付方式
const creditCardResult = processor.processPayment('credit_card', 100, {
  cardNumber: '1234-5678-9012-3456',
  expiryDate: '12/25',
  cvv: '123'
});

const wechatResult = processor.processPayment('wechat_pay', 200, {
  openid: 'wx123456789'
});

console.log(processor.getPaymentMethodDisplayName('wechat_pay'));
```

### 重构后代码

```javascript
// 使用多态和策略模式重构

// 支付策略接口
class PaymentStrategy {
  process(amount, paymentData) {
    throw new Error('子类必须实现process方法');
  }
  
  validate(paymentData) {
    throw new Error('子类必须实现validate方法');
  }
  
  getDisplayName() {
    throw new Error('子类必须实现getDisplayName方法');
  }
}

// 具体的支付策略实现
class CreditCardPayment extends PaymentStrategy {
  process(amount, paymentData) {
    const { cardNumber, expiryDate, cvv } = paymentData;
    console.log(`处理信用卡支付: ${amount}元`);
    // 复杂的信用卡处理逻辑
    return { success: true, transactionId: `CC_${Date.now()}` };
  }
  
  validate(paymentData) {
    return paymentData.cardNumber && paymentData.expiryDate && paymentData.cvv;
  }
  
  getDisplayName() {
    return '信用卡';
  }
}

class PayPalPayment extends PaymentStrategy {
  process(amount, paymentData) {
    const { email, password } = paymentData;
    console.log(`处理PayPal支付: ${amount}元`);
    // 复杂的PayPal处理逻辑
    return { success: true, transactionId: `PP_${Date.now()}` };
  }
  
  validate(paymentData) {
    return paymentData.email && paymentData.password;
  }
  
  getDisplayName() {
    return 'PayPal';
  }
}

class WeChatPayment extends PaymentStrategy {
  process(amount, paymentData) {
    const { openid } = paymentData;
    console.log(`处理微信支付: ${amount}元`);
    // 复杂的微信支付逻辑
    return { success: true, transactionId: `WX_${Date.now()}` };
  }
  
  validate(paymentData) {
    return paymentData.openid;
  }
  
  getDisplayName() {
    return '微信支付';
  }
}

class AlipayPayment extends PaymentStrategy {
  process(amount, paymentData) {
    const { userId } = paymentData;
    console.log(`处理支付宝支付: ${amount}元`);
    // 复杂的支付宝逻辑
    return { success: true, transactionId: `AL_${Date.now()}` };
  }
  
  validate(paymentData) {
    return paymentData.userId;
  }
  
  getDisplayName() {
    return '支付宝';
  }
}

class BankTransferPayment extends PaymentStrategy {
  process(amount, paymentData) {
    const { accountNumber, bankName } = paymentData;
    console.log(`处理银行转账: ${amount}元`);
    // 复杂的银行转账逻辑
    return { success: true, transactionId: `BT_${Date.now()}` };
  }
  
  validate(paymentData) {
    return paymentData.accountNumber && paymentData.bankName;
  }
  
  getDisplayName() {
    return '银行转账';
  }
}

// 支付策略工厂
class PaymentStrategyFactory {
  static createStrategy(paymentMethod) {
    const strategyMap = {
      'credit_card': CreditCardPayment,
      'paypal': PayPalPayment,
      'wechat_pay': WeChatPayment,
      'alipay': AlipayPayment,
      'bank_transfer': BankTransferPayment
    };
    
    const StrategyClass = strategyMap[paymentMethod];
    if (!StrategyClass) {
      throw new Error(`不支持的支付方式: ${paymentMethod}`);
    }
    
    return new StrategyClass();
  }
  
  static getAvailableMethods() {
    return Object.keys(this.strategyMap);
  }
  
  static getDisplayName(paymentMethod) {
    const strategy = this.createStrategy(paymentMethod);
    return strategy.getDisplayName();
  }
}

// 重构后的支付处理器
class PaymentProcessor {
  processPayment(paymentMethod, amount, paymentData) {
    const strategy = PaymentStrategyFactory.createStrategy(paymentMethod);
    
    // 验证支付数据
    if (!strategy.validate(paymentData)) {
      throw new Error('支付数据验证失败');
    }
    
    return strategy.process(amount, paymentData);
  }
  
  // 添加新支付方式很容易
  registerCustomPayment(method, strategyClass) {
    PaymentStrategyFactory.strategyMap[method] = strategyClass;
  }
}

// 配送策略模式
class ShippingStrategy {
  calculateCost(order) {
    throw new Error('子类必须实现calculateCost方法');
  }
  
  getEstimatedDelivery() {
    throw new Error('子类必须实现getEstimatedDelivery方法');
  }
}

class StandardShipping extends ShippingStrategy {
  calculateCost(order) {
    return Math.max(10, order.weight * 2);
  }
  
  getEstimatedDelivery() {
    return '3-5个工作日';
  }
}

class ExpressShipping extends ShippingStrategy {
  calculateCost(order) {
    return Math.max(20, order.weight * 3);
  }
  
  getEstimatedDelivery() {
    return '1-2个工作日';
  }
}

class OvernightShipping extends ShippingStrategy {
  calculateCost(order) {
    return Math.max(50, order.weight * 5);
  }
  
  getEstimatedDelivery() {
    return '次日达';
  }
}

// 客户折扣策略
class DiscountStrategy {
  applyDiscount(amount, customer) {
    throw new Error('子类必须实现applyDiscount方法');
  }
}

class VIPDiscount extends DiscountStrategy {
  applyDiscount(amount, customer) {
    return amount * 0.8; // VIP客户8折
  }
}

class PremiumDiscount extends DiscountStrategy {
  applyDiscount(amount, customer) {
    return amount * 0.9; // 高级客户9折
  }
}

class RegularDiscount extends DiscountStrategy {
  applyDiscount(amount, customer) {
    return amount; // 普通客户无折扣
  }
}

// 配送计算器
class ShippingCalculator {
  constructor() {
    this.shippingStrategies = {
      'standard': new StandardShipping(),
      'express': new ExpressShipping(),
      'overnight': new OvernightShipping()
    };
    
    this.discountStrategies = {
      'vip': new VIPDiscount(),
      'premium': new PremiumDiscount(),
      'regular': new RegularDiscount()
    };
  }
  
  calculateShippingCost(order, shippingMethod) {
    const shippingStrategy = this.shippingStrategies[shippingMethod];
    if (!shippingStrategy) {
      throw new Error(`不支持的配送方式: ${shippingMethod}`);
    }
    
    const baseCost = shippingStrategy.calculateCost(order);
    const discountStrategy = this.discountStrategies[order.customerType] || new RegularDiscount();
    
    return discountStrategy.applyDiscount(baseCost, order.customer);
  }
  
  getShippingInfo(shippingMethod) {
    const strategy = this.shippingStrategies[shippingMethod];
    return {
      displayName: shippingMethod,
      estimatedDelivery: strategy.getEstimatedDelivery()
    };
  }
}

// 使用示例
const processor = new PaymentProcessor();

// 处理支付 - 不再需要switch语句
const creditCardResult = processor.processPayment('credit_card', 100, {
  cardNumber: '1234-5678-9012-3456',
  expiryDate: '12/25',
  cvv: '123'
});

const wechatResult = processor.processPayment('wechat_pay', 200, {
  openid: 'wx123456789'
});

// 获取支付方式显示名称
console.log(PaymentStrategyFactory.getDisplayName('wechat_pay'));

// 配送计算示例
const calculator = new ShippingCalculator();
const order = { weight: 5, customerType: 'vip' };
const shippingCost = calculator.calculateShippingCost(order, 'express');
console.log(`配送费用: ${shippingCost}元`);

// 添加新支付方式很容易
class NewPaymentMethod extends PaymentStrategy {
  process(amount, paymentData) {
    console.log(`处理新支付方式: ${amount}元`);
    return { success: true, transactionId: `NEW_${Date.now()}` };
  }
  
  validate(paymentData) {
    return true;
  }
  
  getDisplayName() {
    return '新支付方式';
  }
}

processor.registerCustomPayment('new_method', NewPaymentMethod);
```

## 课后练习

1. **Switch识别**：找出你项目中的switch语句和长的条件链
2. **策略模式应用**：用策略模式重构条件判断
3. **工厂模式**：使用工厂模式来创建策略对象
4. **开闭原则**：确保新类型的添加不需要修改现有代码

**练习代码**：
```javascript
// 重构以下代码，消除switch语句坏味道
class NotificationService {
  sendNotification(type, user, message) {
    switch (type) {
      case 'email':
        return this.sendEmail(user.email, message);
      case 'sms':
        return this.sendSMS(user.phone, message);
      case 'push':
        return this.sendPushNotification(user.deviceToken, message);
      case 'wechat':
        return this.sendWeChat(user.wechatId, message);
      default:
        throw new Error(`不支持的通知类型: ${type}`);
    }
  }
  
  sendEmail(email, message) {
    console.log(`发送邮件到: ${email}`);
  }
  
  sendSMS(phone, message) {
    console.log(`发送短信到: ${phone}`);
  }
  
  sendPushNotification(deviceToken, message) {
    console.log(`发送推送通知到设备: ${deviceToken}`);
  }
  
  sendWeChat(wechatId, message) {
    console.log(`发送微信消息到: ${wechatId}`);
  }
}