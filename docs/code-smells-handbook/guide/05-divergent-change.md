# 5. 发散式变化 (Divergent Change)

发散式变化是指一个类因为不同的原因而被修改。

## 问题定义

当一个类需要因为多种不同的原因（如业务规则变化、数据格式变化、界面变化等）而被频繁修改时，就出现了发散式变化的坏味道。这表明该类承担了过多的职责。

## 典型症状

1. **修改原因多样**：类因为不同原因被修改
2. **修改频率高**：经常需要修改这个类
3. **职责混杂**：类处理多个不相关的业务逻辑
4. **测试困难**：测试用例需要覆盖多种场景
5. **影响范围大**：修改可能影响不相关的功能

## 重构方法

### 1. 提取类 (Extract Class)
将相关的行为提取到新的类中。

### 2. 搬移函数 (Move Method)
将函数移动到更合适的类中。

### 3. 搬移字段 (Move Field)
将字段移动到更合适的类中。

### 4. 提取接口 (Extract Interface)
定义清晰的接口来分离职责。

### 5. 用委托替代继承 (Replace Inheritance with Delegation)
使用组合而不是继承。

## 实际案例

### 重构前代码

```javascript
class OrderProcessor {
  constructor() {
    this.orders = [];
    this.customers = [];
    this.products = [];
  }
  
  // 处理订单逻辑（会因为业务规则变化而修改）
  processOrder(order) {
    // 验证订单
    if (!this.validateOrder(order)) {
      throw new Error('订单验证失败');
    }
    
    // 计算价格（会因为定价策略变化而修改）
    const total = this.calculateTotal(order);
    
    // 处理支付（会因为支付方式变化而修改）
    const paymentResult = this.processPayment(order, total);
    
    // 更新库存（会因为库存管理规则变化而修改）
    this.updateInventory(order);
    
    // 发送通知（会因为通知方式变化而修改）
    this.sendNotifications(order);
    
    // 记录日志（会因为日志格式变化而修改）
    this.logOrderActivity(order);
    
    return paymentResult;
  }
  
  validateOrder(order) {
    // 复杂的验证逻辑
    return order.items && order.items.length > 0;
  }
  
  calculateTotal(order) {
    // 复杂的价格计算逻辑
    let total = 0;
    for (const item of order.items) {
      total += item.price * item.quantity;
    }
    return total;
  }
  
  processPayment(order, amount) {
    // 复杂的支付处理逻辑
    return { success: true, transactionId: 'txn_123' };
  }
  
  updateInventory(order) {
    // 复杂的库存更新逻辑
    for (const item of order.items) {
      // 更新库存
    }
  }
  
  sendNotifications(order) {
    // 复杂的通知发送逻辑
    // 发送邮件、短信、推送等
  }
  
  logOrderActivity(order) {
    // 复杂的日志记录逻辑
    console.log(`订单处理完成: ${order.id}`);
  }
  
  // 其他不相关的方法（会因为客户管理需求变化而修改）
  addCustomer(customer) {
    this.customers.push(customer);
  }
  
  // 其他不相关的方法（会因为产品管理需求变化而修改）
  addProduct(product) {
    this.products.push(product);
  }
}
```

### 重构后代码

```javascript
// 订单验证类
class OrderValidator {
  validate(order) {
    if (!order.items || order.items.length === 0) {
      throw new Error('订单项目不能为空');
    }
    
    // 更多验证逻辑
    return true;
  }
}

// 价格计算类
class PriceCalculator {
  calculateTotal(order) {
    let total = 0;
    for (const item of order.items) {
      total += item.price * item.quantity;
    }
    return total;
  }
  
  applyDiscounts(order, total) {
    // 折扣应用逻辑
    return total;
  }
}

// 支付处理类
class PaymentProcessor {
  processPayment(order, amount) {
    // 支付处理逻辑
    return { success: true, transactionId: 'txn_123' };
  }
}

// 库存管理类
class InventoryManager {
  updateInventory(order) {
    for (const item of order.items) {
      // 库存更新逻辑
    }
  }
}

// 通知服务类
class NotificationService {
  sendOrderNotifications(order) {
    // 通知发送逻辑
  }
}

// 日志记录类
class OrderLogger {
  logActivity(order, action) {
    console.log(`${action}: ${order.id}`);
  }
}

// 客户管理类
class CustomerManager {
  constructor() {
    this.customers = [];
  }
  
  addCustomer(customer) {
    this.customers.push(customer);
  }
}

// 产品管理类
class ProductManager {
  constructor() {
    this.products = [];
  }
  
  addProduct(product) {
    this.products.push(product);
  }
}

// 重构后的订单处理器（协调各个服务）
class OrderProcessor {
  constructor() {
    this.validator = new OrderValidator();
    this.calculator = new PriceCalculator();
    this.paymentProcessor = new PaymentProcessor();
    this.inventoryManager = new InventoryManager();
    this.notificationService = new NotificationService();
    this.logger = new OrderLogger();
    this.customerManager = new CustomerManager();
    this.productManager = new ProductManager();
    this.orders = [];
  }
  
  processOrder(order) {
    try {
      // 验证订单
      this.validator.validate(order);
      
      // 计算价格
      const total = this.calculator.calculateTotal(order);
      
      // 处理支付
      const paymentResult = this.paymentProcessor.processPayment(order, total);
      
      // 更新库存
      this.inventoryManager.updateInventory(order);
      
      // 发送通知
      this.notificationService.sendOrderNotifications(order);
      
      // 记录日志
      this.logger.logActivity(order, '订单处理完成');
      
      this.orders.push(order);
      return paymentResult;
      
    } catch (error) {
      this.logger.logActivity(order, `订单处理失败: ${error.message}`);
      throw error;
    }
  }
}
```

## 课后练习

1. **变化分析**：找出你项目中经常因为不同原因被修改的类
2. **职责分离**：将不同的职责提取到专门的类中
3. **接口设计**：设计清晰的接口来隔离变化
4. **依赖管理**：减少类之间的直接依赖

**练习代码**：
```javascript
// 重构以下类，解决发散式变化问题
class ReportGenerator {
  generateSalesReport(data) {
    // 数据提取逻辑（会因为数据源变化而修改）
    const extractedData = this.extractData(data);
    
    // 数据转换逻辑（会因为报表格式变化而修改）
    const transformedData = this.transformData(extractedData);
    
    // 报表生成逻辑（会因为输出格式变化而修改）
    const report = this.generateReport(transformedData);
    
    // 文件保存逻辑（会因为存储方式变化而修改）
    this.saveReport(report);
    
    // 邮件发送逻辑（会因为通知方式变化而修改）
    this.sendReportByEmail(report);
    
    return report;
  }
  
  extractData(data) { /* 数据提取 */ }
  transformData(data) { /* 数据转换 */ }
  generateReport(data) { /* 报表生成 */ }
  saveReport(report) { /* 文件保存 */ }
  sendReportByEmail(report) { /* 邮件发送 */ }
}