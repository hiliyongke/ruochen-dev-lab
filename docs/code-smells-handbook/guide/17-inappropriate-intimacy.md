# 17. 不恰当的亲密关系 (Inappropriate Intimacy)

不恰当的亲密关系是指两个类之间过度了解对方的内部实现细节。

## 问题定义

当两个类之间相互访问对方的私有数据或内部实现细节，违反了封装原则时，就出现了不恰当的亲密关系坏味道。这种关系使得两个类紧密耦合，难以独立修改。

## 典型症状

1. **私有访问**：直接访问对方的私有字段或方法
2. **内部依赖**：依赖于对方的内部实现细节
3. **双向耦合**：两个类相互依赖
4. **修改困难**：修改一个类会影响另一个类
5. **测试困难**：难以独立测试每个类

## 重构方法

### 1. 搬移方法 (Move Method)
将方法移动到更合适的类中。

### 2. 搬移字段 (Move Field)
将字段移动到更合适的类中。

### 3. 用委托替代继承 (Replace Inheritance with Delegation)
用委托关系替代继承关系。

### 4. 提取类 (Extract Class)
提取公共部分到新的类中。

### 5. 隐藏委托 (Hide Delegate)
通过委托方法来隐藏直接访问。

## 实际案例

### 重构前代码

```javascript
// 不恰当的亲密关系典型例子

class Order {
  constructor(id, customer, items) {
    this.id = id;
    this.customer = customer;
    this.items = items;
    this.status = 'pending';
    this.createdAt = new Date();
    this.updatedAt = new Date();
    // 私有字段
    this._discount = 0;
    this._taxRate = 0.1;
  }
  
  calculateTotal() {
    const subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * this._taxRate;
    const discount = this._discount;
    return subtotal + tax - discount;
  }
  
  applyDiscount(discount) {
    this._discount = discount;
    this.updatedAt = new Date();
  }
  
  setTaxRate(rate) {
    this._taxRate = rate;
    this.updatedAt = new Date();
  }
  
  // 私有方法
  _validateItems() {
    return this.items.every(item => item.price > 0 && item.quantity > 0);
  }
}

class OrderProcessor {
  constructor() {
    this.processedOrders = new Map();
  }
  
  // 不恰当的亲密关系 - 直接访问Order的私有字段和方法
  processOrder(order) {
    // 直接访问私有方法
    if (!order._validateItems()) {
      throw new Error('订单商品无效');
    }
    
    // 直接修改私有字段
    if (order.customer.isVIP) {
      order._discount = order.calculateTotal() * 0.1; // VIP客户10%折扣
    }
    
    // 直接访问私有字段进行计算
    const finalAmount = order.calculateTotal();
    
    // 直接修改状态字段
    order.status = 'processed';
    order.updatedAt = new Date();
    
    this.processedOrders.set(order.id, {
      order: order,
      processedAt: new Date(),
      finalAmount: finalAmount
    });
    
    return finalAmount;
  }
  
  // 更多不恰当的访问
  adjustOrderDiscount(order, newDiscount) {
    // 直接访问私有字段
    order._discount = newDiscount;
    order.updatedAt = new Date();
    
    const newAmount = order.calculateTotal();
    const processedInfo = this.processedOrders.get(order.id);
    if (processedInfo) {
      processedInfo.finalAmount = newAmount;
    }
    
    return newAmount;
  }
  
  getOrderDetails(order) {
    // 暴露私有信息
    return {
      id: order.id,
      status: order.status,
      subtotal: order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      tax: order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * order._taxRate,
      discount: order._discount,
      finalAmount: order.calculateTotal(),
      // 直接访问其他私有信息
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }
}

class Customer {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.isVIP = false;
    this._purchaseHistory = [];
    this._creditLimit = 1000;
  }
  
  // OrderProcessor不恰当地访问这些私有字段
  addPurchase(order) {
    this._purchaseHistory.push(order);
  }
  
  getPurchaseHistory() {
    return [...this._purchaseHistory];
  }
  
  // 私有方法
  _calculateLifetimeValue() {
    return this._purchaseHistory.reduce((sum, order) => sum + order.calculateTotal(), 0);
  }
}

// 使用示例 - 不恰当的亲密关系导致紧耦合
const customer = new Customer(1, '张三', 'zhangsan@example.com');
customer.isVIP = true;

const order = new Order(101, customer, [
  { id: 1, name: '商品A', price: 100, quantity: 2 },
  { id: 2, name: '商品B', price: 50, quantity: 1 }
]);

const processor = new OrderProcessor();

// OrderProcessor直接操作Order的私有字段和方法
const finalAmount = processor.processOrder(order);
console.log('订单金额:', finalAmount);

// 直接调整折扣（访问私有字段）
const adjustedAmount = processor.adjustOrderDiscount(order, 20);
console.log('调整后金额:', adjustedAmount);

// 获取订单详情（暴露私有信息）
const details = processor.getOrderDetails(order);
console.log('订单详情:', details);

// 问题：OrderProcessor过度了解Order的内部实现
```

### 重构后代码

```javascript
// 重构后的代码 - 通过公共接口交互，保持封装

class Order {
  constructor(id, customer, items) {
    this.id = id;
    this.customer = customer;
    this.items = items;
    this.status = 'pending';
    this.createdAt = new Date();
    this.updatedAt = new Date();
    // 私有字段 - 外部不能直接访问
    this._discount = 0;
    this._taxRate = 0.1;
  }
  
  // 提供公共接口来操作订单
  calculateTotal() {
    const subtotal = this.calculateSubtotal();
    const tax = this.calculateTax(subtotal);
    const discount = this._discount;
    return subtotal + tax - discount;
  }
  
  calculateSubtotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
  
  calculateTax(subtotal = null) {
    const baseAmount = subtotal !== null ? subtotal : this.calculateSubtotal();
    return baseAmount * this._taxRate;
  }
  
  // 通过公共方法设置折扣
  applyDiscount(discount) {
    if (discount < 0) {
      throw new Error('折扣不能为负数');
    }
    
    const subtotal = this.calculateSubtotal();
    if (discount > subtotal) {
      throw new Error('折扣不能超过订单金额');
    }
    
    this._discount = discount;
    this.updatedAt = new Date();
    return this.calculateTotal();
  }
  
  // 通过公共方法设置税率
  setTaxRate(rate) {
    if (rate < 0 || rate > 1) {
      throw new Error('税率必须在0-1之间');
    }
    
    this._taxRate = rate;
    this.updatedAt = new Date();
    return this.calculateTotal();
  }
  
  // 状态管理
  markAsProcessed() {
    this.status = 'processed';
    this.updatedAt = new Date();
  }
  
  markAsShipped() {
    this.status = 'shipped';
    this.updatedAt = new Date();
  }
  
  markAsDelivered() {
    this.status = 'delivered';
    this.updatedAt = new Date();
  }
  
  // 验证逻辑
  validate() {
    const errors = [];
    
    if (!this.id) {
      errors.push('订单ID不能为空');
    }
    
    if (!this.customer) {
      errors.push('客户信息不能为空');
    }
    
    if (!this.items || this.items.length === 0) {
      errors.push('订单商品不能为空');
    }
    
    const itemsValid = this.items.every(item => 
      item && item.price > 0 && item.quantity > 0
    );
    
    if (!itemsValid) {
      errors.push('订单商品信息无效');
    }
    
    return errors.length === 0 ? null : errors;
  }
  
  // 提供有限的订单信息（不暴露私有字段）
  getSummary() {
    return {
      id: this.id,
      status: this.status,
      customerName: this.customer.name,
      itemCount: this.items.length,
      subtotal: this.calculateSubtotal(),
      finalAmount: this.calculateTotal(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
  
  // 不暴露私有字段的详细信息
  getDetailedInfo() {
    return {
      ...this.getSummary(),
      taxAmount: this.calculateTax(),
      discountAmount: this._discount,
      items: this.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      }))
    };
  }
  
  // 不暴露私有方法的验证
  isValid() {
    return this.validate() === null;
  }
}

class OrderProcessor {
  constructor() {
    this.processedOrders = new Map();
  }
  
  // 通过公共接口处理订单，不访问私有字段
  processOrder(order) {
    // 使用公共验证方法
    if (!order.isValid()) {
      throw new Error('订单数据无效');
    }
    
    // 通过公共方法应用VIP折扣
    if (order.customer.isVIP) {
      const subtotal = order.calculateSubtotal();
      const vipDiscount = subtotal * 0.1;
      order.applyDiscount(vipDiscount);
    }
    
    // 使用公共方法标记状态
    order.markAsProcessed();
    
    const finalAmount = order.calculateTotal();
    
    this.processedOrders.set(order.id, {
      orderId: order.id,
      processedAt: new Date(),
      finalAmount: finalAmount,
      customerName: order.customer.name
    });
    
    return finalAmount;
  }
  
  // 通过公共接口调整折扣
  adjustOrderDiscount(order, newDiscount) {
    const newAmount = order.applyDiscount(newDiscount);
    
    const processedInfo = this.processedOrders.get(order.id);
    if (processedInfo) {
      processedInfo.finalAmount = newAmount;
      processedInfo.updatedAt = new Date();
    }
    
    return newAmount;
  }
  
  // 通过公共接口获取订单信息
  getOrderDetails(order) {
    return order.getDetailedInfo();
  }
  
  // 批量处理订单
  processOrders(orders) {
    const results = [];
    
    for (const order of orders) {
      try {
        const amount = this.processOrder(order);
        results.push({
          orderId: order.id,
          success: true,
          amount: amount
        });
      } catch (error) {
        results.push({
          orderId: order.id,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }
}

class Customer {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.isVIP = false;
    // 私有字段
    this._purchaseHistory = [];
    this._creditLimit = 1000;
  }
  
  // 提供公共接口管理购买历史
  addPurchase(orderSummary) {
    this._purchaseHistory.push({
      orderId: orderSummary.id,
      amount: orderSummary.finalAmount,
      date: orderSummary.createdAt
    });
  }
  
  getPurchaseHistory() {
    return [...this._purchaseHistory];
  }
  
  getLifetimeValue() {
    return this._purchaseHistory.reduce((sum, purchase) => sum + purchase.amount, 0);
  }
  
  // 客户相关的业务逻辑
  canMakePurchase(amount) {
    const lifetimeValue = this.getLifetimeValue();
    const availableCredit = this._creditLimit - lifetimeValue;
    return amount <= availableCredit;
  }
  
  upgradeToVIP() {
    this.isVIP = true;
    this._creditLimit = 5000; // VIP客户更高信用额度
  }
}

// 使用示例 - 通过公共接口交互，保持封装
const customer = new Customer(1, '张三', 'zhangsan@example.com');
customer.upgradeToVIP();

const order = new Order(101, customer, [
  { id: 1, name: '商品A', price: 100, quantity: 2 },
  { id: 2, name: '商品B', price: 50, quantity: 1 }
]);

const processor = new OrderProcessor();

// 通过公共接口处理订单
const finalAmount = processor.processOrder(order);
console.log('订单金额:', finalAmount);

// 通过公共接口调整折扣
const adjustedAmount = processor.adjustOrderDiscount(order, 20);
console.log('调整后金额:', adjustedAmount);

// 通过公共接口获取订单信息
const details = processor.getOrderDetails(order);
console.log('订单详情:', details);

// 客户添加购买记录（通过公共接口）
customer.addPurchase(order.getSummary());
console.log('客户终身价值:', customer.getLifetimeValue());

// 2. 使用领域服务处理复杂业务
class OrderManagementService {
  constructor(orderProcessor, customerService, notificationService) {
    this.orderProcessor = orderProcessor;
    this.customerService = customerService;
    this.notificationService = notificationService;
  }
  
  async processOrderWithCustomerUpdates(order) {
    // 处理订单
    const finalAmount = this.orderProcessor.processOrder(order);
    
    // 更新客户信息
    const customer = order.customer;
    customer.addPurchase(order.getSummary());
    
    // 检查是否需要升级为VIP
    const lifetimeValue = customer.getLifetimeValue();
    if (lifetimeValue > 1000 && !customer.isVIP) {
      customer.upgradeToVIP();
      await this.notificationService.sendVIPUpgradeNotification(customer.email);
    }
    
    // 发送订单确认通知
    await this.notificationService.sendOrderConfirmation(customer.email, order.getSummary());
    
    return {
      orderId: order.id,
      finalAmount: finalAmount,
      customerUpdated: true,
      vipUpgraded: customer.isVIP
    };
  }
  
  async processBulkOrders(orders) {
    const results = [];
    
    for (const order of orders) {
      try {
        const result = await this.processOrderWithCustomerUpdates(order);
        results.push({
          ...result,
          success: true
        });
      } catch (error) {
        results.push({
          orderId: order.id,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }
}

// 3. 使用事件驱动架构减少耦合
class OrderEventEmitter {
  constructor() {
    this.listeners = new Map();
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  emit(event, data) {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }
}

class EventDrivenOrderProcessor {
  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.eventEmitter.on('order.processed', (orderData) => {
      console.log('订单处理完成:', orderData);
      // 这里可以触发其他业务逻辑，但不需要直接访问Order的内部
    });
    
    this.eventEmitter.on('order.failed', (errorData) => {
      console.log('订单处理失败:', errorData);
    });
  }
  
  processOrder(order) {
    try {
      if (!order.isValid()) {
        throw new Error('订单数据无效');
      }
      
      order.markAsProcessed();
      const finalAmount = order.calculateTotal();
      
      this.eventEmitter.emit('order.processed', {
        orderId: order.id,
        amount: finalAmount,
        customerName: order.customer.name
      });
      
      return finalAmount;
    } catch (error) {
      this.eventEmitter.emit('order.failed', {
        orderId: order.id,
        error: error.message
      });
      throw error;
    }
  }
}

// 使用事件驱动架构
const eventEmitter = new OrderEventEmitter();
const eventDrivenProcessor = new EventDrivenOrderProcessor(eventEmitter);

// 添加其他事件监听器
eventEmitter.on('order.processed', (data) => {
  // 库存管理服务监听订单处理事件
  console.log('更新库存:', data);
});

eventEmitter.on('order.processed', (data) => {
  // 财务服务监听订单处理事件
  console.log('记录财务流水:', data);
});

// 处理订单（通过事件驱动）
const eventDrivenAmount = eventDrivenProcessor.processOrder(order);
console.log('事件驱动处理金额:', eventDrivenAmount);
```

## 课后练习

1. **亲密关系识别**：找出项目中不恰当的亲密关系
2. **封装重构**：通过公共接口替代直接访问
3. **事件驱动**：使用事件驱动架构解耦
4. **领域服务**：设计专门的领域服务

**练习代码**：
```javascript
// 重构以下代码，解决不恰当的亲密关系
class User {
  constructor() {
    this._password = '';
    this._loginAttempts = 0;
  }
}

class LoginService {
  // 不恰当地访问User的私有字段
  validateUser(user, password) {
    return user._password === password && user._loginAttempts < 3;
  }
}