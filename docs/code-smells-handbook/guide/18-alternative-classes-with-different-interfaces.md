# 18. 接口不同的等价类 (Alternative Classes with Different Interfaces)

接口不同的等价类是指功能相同但接口不同的类。

## 问题定义

当系统中存在多个功能相同或相似的类，但它们提供了不同的接口（方法名、参数、返回值等）时，就出现了接口不同的等价类坏味道。这种设计增加了系统的复杂性和维护成本。

## 典型症状

1. **功能重复**：多个类实现相同的功能
2. **接口差异**：相同功能使用不同的方法名或参数
3. **选择困难**：开发人员不知道使用哪个类
4. **维护成本**：需要维护多个相似的实现
5. **学习曲线**：需要学习多个不同的接口

## 重构方法

### 1. 重命名方法 (Rename Method)
统一方法名称。

### 2. 搬移方法 (Move Method)
将方法移动到统一的接口中。

### 3. 提取超类 (Extract Superclass)
提取公共父类或接口。

### 4. 用多态替代条件表达式 (Replace Conditional with Polymorphism)
用多态处理不同的实现。

### 5. 引入适配器 (Introduce Adapter)
使用适配器模式统一接口。

## 实际案例

### 重构前代码

```javascript
// 接口不同的等价类典型例子

// 第一个支付处理器 - PayPal风格接口
class PayPalPaymentProcessor {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://api.paypal.com';
  }
  
  // 不同的方法名和参数
  executePayment(amount, currency, recipient) {
    console.log(`PayPal: 支付 ${amount} ${currency} 给 ${recipient}`);
    // 模拟PayPal API调用
    return {
      transactionId: `PP_${Date.now()}`,
      status: 'completed',
      amount: amount,
      currency: currency,
      recipient: recipient
    };
  }
  
  // 退款使用不同的方法名
  refundTransaction(transactionId, amount) {
    console.log(`PayPal: 退款 ${amount} 给交易 ${transactionId}`);
    return {
      refundId: `PP_REFUND_${Date.now()}`,
      status: 'refunded',
      amount: amount
    };
  }
  
  // 查询交易状态
  getTransactionStatus(transactionId) {
    return {
      transactionId: transactionId,
      status: 'completed',
      timestamp: new Date()
    };
  }
}

// 第二个支付处理器 - Stripe风格接口
class StripePaymentProcessor {
  constructor(secretKey) {
    this.secretKey = secretKey;
    this.baseUrl = 'https://api.stripe.com';
  }
  
  // 不同的方法名和参数
  createCharge(amount, currency, customer, description) {
    console.log(`Stripe: 创建支付 ${amount} ${currency} 给客户 ${customer}`);
    return {
      id: `ch_${Date.now()}`,
      object: 'charge',
      amount: amount,
      currency: currency,
      status: 'succeeded',
      customer: customer,
      description: description
    };
  }
  
  // 退款使用不同的方法名
  createRefund(chargeId, amount) {
    console.log(`Stripe: 创建退款 ${amount} 给支付 ${chargeId}`);
    return {
      id: `re_${Date.now()}`,
      object: 'refund',
      amount: amount,
      charge: chargeId,
      status: 'succeeded'
    };
  }
  
  // 查询支付状态
  retrieveCharge(chargeId) {
    return {
      id: chargeId,
      object: 'charge',
      status: 'succeeded',
      created: Date.now()
    };
  }
}

// 第三个支付处理器 - 银行转账风格接口
class BankTransferProcessor {
  constructor(bankCode, accountNumber) {
    this.bankCode = bankCode;
    this.accountNumber = accountNumber;
  }
  
  // 完全不同的接口
  transferMoney(amount, toAccount, description) {
    console.log(`银行转账: 转账 ${amount} 到账户 ${toAccount}`);
    return {
      referenceNumber: `BT_${Date.now()}`,
      fromAccount: this.accountNumber,
      toAccount: toAccount,
      amount: amount,
      status: 'processed',
      description: description
    };
  }
  
  // 取消转账
  cancelTransfer(referenceNumber) {
    console.log(`取消银行转账: ${referenceNumber}`);
    return {
      referenceNumber: referenceNumber,
      status: 'cancelled'
    };
  }
  
  // 查询转账状态
  checkTransferStatus(referenceNumber) {
    return {
      referenceNumber: referenceNumber,
      status: 'completed',
      timestamp: new Date()
    };
  }
}

// 使用示例 - 接口不同的等价类导致使用复杂
const paypalProcessor = new PayPalPaymentProcessor('key123', 'secret456');
const stripeProcessor = new StripePaymentProcessor('sk_test_123');
const bankProcessor = new BankTransferProcessor('ICBC', '622848001234567890');

// 支付操作 - 每个处理器接口都不同
const paypalResult = paypalProcessor.executePayment(100, 'USD', 'merchant@example.com');
const stripeResult = stripeProcessor.createCharge(100, 'usd', 'cus_123', '商品购买');
const bankResult = bankProcessor.transferMoney(100, '622848009876543210', '货款支付');

// 退款操作 - 接口差异更大
const paypalRefund = paypalProcessor.refundTransaction(paypalResult.transactionId, 50);
const stripeRefund = stripeProcessor.createRefund(stripeResult.id, 50);
// 银行转账不支持部分退款，只能取消
const bankCancel = bankProcessor.cancelTransfer(bankResult.referenceNumber);

// 查询状态 - 每个处理器返回的数据结构也不同
const paypalStatus = paypalProcessor.getTransactionStatus(paypalResult.transactionId);
const stripeStatus = stripeProcessor.retrieveCharge(stripeResult.id);
const bankStatus = bankProcessor.checkTransferStatus(bankResult.referenceNumber);

console.log('PayPal结果:', paypalResult);
console.log('Stripe结果:', stripeResult);
console.log('银行转账结果:', bankResult);

// 问题：相同的支付功能，完全不同的接口，难以统一使用
```

### 重构后代码

```javascript
// 重构后的代码 - 统一支付接口

// 统一的支付结果接口
class PaymentResult {
  constructor(provider, transactionId, amount, currency, status) {
    this.provider = provider;
    this.transactionId = transactionId;
    this.amount = amount;
    this.currency = currency;
    this.status = status;
    this.timestamp = new Date();
  }
}

// 统一的退款结果接口
class RefundResult {
  constructor(provider, refundId, amount, status) {
    this.provider = provider;
    this.refundId = refundId;
    this.amount = amount;
    this.status = status;
    this.timestamp = new Date();
  }
}

// 统一的支付接口
class PaymentProcessor {
  constructor(provider) {
    this.provider = provider;
  }
  
  // 统一的支付方法
  async pay(amount, currency, options = {}) {
    throw new Error('子类必须实现pay方法');
  }
  
  // 统一的退款方法
  async refund(transactionId, amount, options = {}) {
    throw new Error('子类必须实现refund方法');
  }
  
  // 统一的查询方法
  async getStatus(transactionId) {
    throw new Error('子类必须实现getStatus方法');
  }
  
  // 统一的验证方法
  validateAmount(amount) {
    if (amount <= 0) {
      throw new Error('支付金额必须大于0');
    }
    return true;
  }
  
  validateCurrency(currency) {
    const validCurrencies = ['USD', 'EUR', 'CNY', 'GBP', 'JPY'];
    if (!validCurrencies.includes(currency.toUpperCase())) {
      throw new Error(`不支持的货币: ${currency}`);
    }
    return true;
  }
}

// PayPal支付处理器 - 实现统一接口
class PayPalPaymentProcessor extends PaymentProcessor {
  constructor(apiKey, apiSecret) {
    super('paypal');
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://api.paypal.com';
  }
  
  async pay(amount, currency, options = {}) {
    this.validateAmount(amount);
    this.validateCurrency(currency);
    
    const recipient = options.recipient || options.customerEmail;
    if (!recipient) {
      throw new Error('PayPal支付需要指定收款人');
    }
    
    console.log(`PayPal: 支付 ${amount} ${currency} 给 ${recipient}`);
    
    // 模拟API调用
    return new PaymentResult(
      this.provider,
      `PP_${Date.now()}`,
      amount,
      currency,
      'completed'
    );
  }
  
  async refund(transactionId, amount, options = {}) {
    this.validateAmount(amount);
    
    console.log(`PayPal: 退款 ${amount} 给交易 ${transactionId}`);
    
    return new RefundResult(
      this.provider,
      `PP_REFUND_${Date.now()}`,
      amount,
      'refunded'
    );
  }
  
  async getStatus(transactionId) {
    return {
      transactionId: transactionId,
      status: 'completed',
      provider: this.provider,
      timestamp: new Date()
    };
  }
}

// Stripe支付处理器 - 实现统一接口
class StripePaymentProcessor extends PaymentProcessor {
  constructor(secretKey) {
    super('stripe');
    this.secretKey = secretKey;
    this.baseUrl = 'https://api.stripe.com';
  }
  
  async pay(amount, currency, options = {}) {
    this.validateAmount(amount);
    this.validateCurrency(currency);
    
    const customer = options.customer || options.recipient;
    const description = options.description || '支付';
    
    if (!customer) {
      throw new Error('Stripe支付需要指定客户');
    }
    
    console.log(`Stripe: 创建支付 ${amount} ${currency} 给客户 ${customer}`);
    
    return new PaymentResult(
      this.provider,
      `ch_${Date.now()}`,
      amount,
      currency,
      'succeeded'
    );
  }
  
  async refund(transactionId, amount, options = {}) {
    this.validateAmount(amount);
    
    console.log(`Stripe: 创建退款 ${amount} 给支付 ${transactionId}`);
    
    return new RefundResult(
      this.provider,
      `re_${Date.now()}`,
      amount,
      'succeeded'
    );
  }
  
  async getStatus(transactionId) {
    return {
      transactionId: transactionId,
      status: 'succeeded',
      provider: this.provider,
      created: Date.now()
    };
  }
}

// 银行转账处理器 - 实现统一接口
class BankTransferProcessor extends PaymentProcessor {
  constructor(bankCode, accountNumber) {
    super('bank_transfer');
    this.bankCode = bankCode;
    this.accountNumber = accountNumber;
  }
  
  async pay(amount, currency, options = {}) {
    this.validateAmount(amount);
    this.validateCurrency(currency);
    
    const toAccount = options.toAccount || options.recipient;
    const description = options.description || '转账';
    
    if (!toAccount) {
      throw new Error('银行转账需要指定收款账户');
    }
    
    console.log(`银行转账: 转账 ${amount} ${currency} 到账户 ${toAccount}`);
    
    return new PaymentResult(
      this.provider,
      `BT_${Date.now()}`,
      amount,
      currency,
      'processed'
    );
  }
  
  async refund(transactionId, amount, options = {}) {
    // 银行转账通常不支持退款，只能取消
    console.log(`银行转账: 取消转账 ${transactionId}`);
    
    return new RefundResult(
      this.provider,
      `BT_CANCEL_${Date.now()}`,
      amount,
      'cancelled'
    );
  }
  
  async getStatus(transactionId) {
    return {
      transactionId: transactionId,
      status: 'completed',
      provider: this.provider,
      timestamp: new Date()
    };
  }
}

// 使用示例 - 统一的接口，简化使用
const paypalProcessor = new PayPalPaymentProcessor('key123', 'secret456');
const stripeProcessor = new StripePaymentProcessor('sk_test_123');
const bankProcessor = new BankTransferProcessor('ICBC', '622848001234567890');

// 支付操作 - 统一的接口
const paypalResult = await paypalProcessor.pay(100, 'USD', { 
  recipient: 'merchant@example.com' 
});

const stripeResult = await stripeProcessor.pay(100, 'USD', { 
  customer: 'cus_123', 
  description: '商品购买' 
});

const bankResult = await bankProcessor.pay(100, 'CNY', { 
  toAccount: '622848009876543210', 
  description: '货款支付' 
});

// 退款操作 - 统一的接口
const paypalRefund = await paypalProcessor.refund(paypalResult.transactionId, 50);
const stripeRefund = await stripeProcessor.refund(stripeResult.transactionId, 50);
const bankRefund = await bankProcessor.refund(bankResult.transactionId, 100); // 全额取消

// 查询状态 - 统一的接口
const paypalStatus = await paypalProcessor.getStatus(paypalResult.transactionId);
const stripeStatus = await stripeProcessor.getStatus(stripeResult.transactionId);
const bankStatus = await bankProcessor.getStatus(bankResult.transactionId);

console.log('PayPal支付结果:', paypalResult);
console.log('Stripe支付结果:', stripeResult);
console.log('银行转账结果:', bankResult);

// 2. 使用支付服务统一管理不同处理器
class PaymentService {
  constructor() {
    this.processors = new Map();
  }
  
  registerProcessor(name, processor) {
    this.processors.set(name, processor);
  }
  
  async processPayment(processorName, amount, currency, options = {}) {
    const processor = this.processors.get(processorName);
    if (!processor) {
      throw new Error(`未注册的支付处理器: ${processorName}`);
    }
    
    try {
      const result = await processor.pay(amount, currency, options);
      console.log(`支付成功: ${processorName} - ${result.transactionId}`);
      return result;
    } catch (error) {
      console.error(`支付失败: ${processorName} - ${error.message}`);
      throw error;
    }
  }
  
  async processRefund(processorName, transactionId, amount, options = {}) {
    const processor = this.processors.get(processorName);
    if (!processor) {
      throw new Error(`未注册的支付处理器: ${processorName}`);
    }
    
    try {
      const result = await processor.refund(transactionId, amount, options);
      console.log(`退款成功: ${processorName} - ${result.refundId}`);
      return result;
    } catch (error) {
      console.error(`退款失败: ${processorName} - ${error.message}`);
      throw error;
    }
  }
  
  // 批量支付处理
  async processBatchPayments(payments) {
    const results = [];
    
    for (const payment of payments) {
      try {
        const result = await this.processPayment(
          payment.processor,
          payment.amount,
          payment.currency,
          payment.options
        );
        results.push({
          ...payment,
          success: true,
          result: result
        });
      } catch (error) {
        results.push({
          ...payment,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  // 根据条件自动选择支付处理器
  async autoProcessPayment(amount, currency, userPreferences = {}) {
    const availableProcessors = Array.from(this.processors.entries());
    
    // 简单的选择逻辑
    let selectedProcessor = null;
    
    // 优先考虑用户偏好
    if (userPreferences.preferredProcessor && 
        this.processors.has(userPreferences.preferredProcessor)) {
      selectedProcessor = userPreferences.preferredProcessor;
    }
    // 根据金额选择
    else if (amount > 1000) {
      selectedProcessor = 'bank_transfer'; // 大额用银行转账
    }
    // 根据货币选择
    else if (currency === 'CNY') {
      selectedProcessor = this.processors.has('alipay') ? 'alipay' : 'bank_transfer';
    }
    else {
      selectedProcessor = 'paypal'; // 默认用PayPal
    }
    
    if (!selectedProcessor || !this.processors.has(selectedProcessor)) {
      // 回退到第一个可用的处理器
      selectedProcessor = availableProcessors[0]?.[0] || 'paypal';
    }
    
    return await this.processPayment(selectedProcessor, amount, currency, userPreferences);
  }
}

// 使用支付服务
const paymentService = new PaymentService();
paymentService.registerProcessor('paypal', paypalProcessor);
paymentService.registerProcessor('stripe', stripeProcessor);
paymentService.registerProcessor('bank_transfer', bankProcessor);

// 统一的支付接口
const payment1 = await paymentService.processPayment('paypal', 100, 'USD', {
  recipient: 'merchant@example.com'
});

const payment2 = await paymentService.processPayment('stripe', 200, 'EUR', {
  customer: 'cus_456',
  description: '服务费用'
});

// 自动选择支付处理器
const autoPayment = await paymentService.autoProcessPayment(50, 'USD', {
  preferredProcessor: 'stripe'
});

// 批量支付
const batchPayments = [
  { processor: 'paypal', amount: 100, currency: 'USD', options: { recipient: 'test1@example.com' } },
  { processor: 'stripe', amount: 200, currency: 'EUR', options: { customer: 'test2@example.com' } }
];

const batchResults = await paymentService.processBatchPayments(batchPayments);
console.log('批量支付结果:', batchResults);

// 3. 使用适配器模式兼容旧接口
class LegacyPaymentAdapter {
  constructor(legacyProcessor) {
    this.legacyProcessor = legacyProcessor;
  }
  
  async pay(amount, currency, options = {}) {
    // 适配不同的旧接口
    if (this.legacyProcessor.executePayment) {
      // PayPal风格接口
      const result = this.legacyProcessor.executePayment(amount, currency, options.recipient);
      return new PaymentResult('paypal', result.transactionId, amount, currency, 'completed');
    }
    else if (this.legacyProcessor.createCharge) {
      // Stripe风格接口
      const result = this.legacyProcessor.createCharge(amount, currency, options.customer, options.description);
      return new PaymentResult('stripe', result.id, amount, currency, 'succeeded');
    }
    else if (this.legacyProcessor.transferMoney) {
      // 银行转账风格接口
      const result = this.legacyProcessor.transferMoney(amount, options.toAccount, options.description);
      return new PaymentResult('bank_transfer', result.referenceNumber, amount, currency, 'processed');
    }
    else {
      throw new Error('不支持的支付处理器接口');
    }
  }
  
  async refund(transactionId, amount, options = {}) {
    // 适配不同的退款接口
    if (this.legacyProcessor.refundTransaction) {
      const result = this.legacyProcessor.refundTransaction(transactionId, amount);
      return new RefundResult('paypal', result.refundId, amount, 'refunded');
    }
    else if (this.legacyProcessor.createRefund) {
      const result = this.legacyProcessor.createRefund(transactionId, amount);
      return new RefundResult('stripe', result.id, amount, 'succeeded');
    }
    else if (this.legacyProcessor.cancelTransfer) {
      const result = this.legacyProcessor.cancelTransfer(transactionId);
      return new RefundResult('bank_transfer', `cancel_${Date.now()}`, amount, 'cancelled');
    }
    else {
      throw new Error('不支持的退款接口');
    }
  }
  
  async getStatus(transactionId) {
    // 适配不同的状态查询接口
    if (this.legacyProcessor.getTransactionStatus) {
      return this.legacyProcessor.getTransactionStatus(transactionId);
    }
    else if (this.legacyProcessor.retrieveCharge) {
      return this.legacyProcessor.retrieveCharge(transactionId);
    }
    else if (this.legacyProcessor.checkTransferStatus) {
      return this.legacyProcessor.checkTransferStatus(transactionId);
    }
    else {
      throw new Error('不支持的状态查询接口');
    }
  }
}

// 使用适配器兼容旧代码
const legacyPaypal = new PayPalPaymentProcessor('old_key', 'old_secret');
const paypalAdapter = new LegacyPaymentAdapter(legacyPaypal);

// 现在可以使用统一的接口
const adaptedResult = await paypalAdapter.pay(100, 'USD', { recipient: 'test@example.com' });
console.log('适配器支付结果:', adaptedResult);

// 4. 使用工厂模式创建支付处理器
class PaymentProcessorFactory {
  static createProcessor(type, config) {
    switch (type) {
      case 'paypal':
        return new PayPalPaymentProcessor(config.apiKey, config.apiSecret);
      case 'stripe':
        return new StripePaymentProcessor(config.secretKey);
      case 'bank_transfer':
        return new BankTransferProcessor(config.bankCode, config.accountNumber);
      case 'legacy':
        const legacyProcessor = this.createLegacyProcessor(config.legacyType, config);
        return new LegacyPaymentAdapter(legacyProcessor);
      default:
        throw new Error(`不支持的支付类型: ${type}`);
    }
  }
  
  static createLegacyProcessor(legacyType, config) {
    switch (legacyType) {
      case 'paypal':
        return new PayPalPaymentProcessor(config.apiKey, config.apiSecret);
      case 'stripe':
        return new StripePaymentProcessor(config.secretKey);
      case 'bank_transfer':
        return new BankTransferProcessor(config.bankCode, config.accountNumber);
      default:
        throw new Error(`不支持的旧支付类型: ${legacyType}`);
    }
  }
}

// 使用工厂创建支付处理器
const factoryPaypal = PaymentProcessorFactory.createProcessor('paypal', {
  apiKey: 'key123',
  apiSecret: 'secret456'
});

const factoryStripe = PaymentProcessorFactory.createProcessor('stripe', {
  secretKey: 'sk_test_123'
});

// 统一的使用方式
const factoryResult1 = await factoryPaypal.pay(100, 'USD', { recipient: 'test@example.com' });
const factoryResult2 = await factoryStripe.pay(200, 'EUR', { customer: 'cus_789' });

console.log('工厂模式支付结果1:', factoryResult1);
console.log('工厂模式支付结果2:', factoryResult2);
```

## 课后练习

1. **接口识别**：找出项目中接口不同的等价类
2. **统一接口**：为等价类设计统一的接口
3. **适配器模式**：使用适配器模式兼容旧接口
4. **工厂模式**：使用工厂模式创建统一的对象

**练习代码**：
```javascript
// 重构以下代码，统一不同的日志记录器接口
class FileLogger {
  writeLog(message) {
    // 写入文件日志
  }
}

class ConsoleLogger {
  log(message, level) {
    // 控制台日志
  }
}

class DatabaseLogger {
  saveLog(entry) {
    // 数据库日志
  }
}