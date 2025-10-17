# 7. 依恋情结 (Feature Envy)

依恋情结是指一个函数过度访问另一个对象的数据。

## 问题定义

当一个函数更多地使用另一个对象的字段和方法，而不是自己所在对象的字段和方法时，就出现了依恋情结的坏味道。这表明函数可能更适合放在被访问的对象中。

## 典型症状

1. **频繁访问**：函数频繁调用其他对象的方法
2. **数据获取**：函数从其他对象获取大量数据
3. **逻辑外置**：业务逻辑放在不合适的类中
4. **耦合度高**：函数与被访问对象紧密耦合
5. **职责错位**：函数职责应该属于被访问对象

## 重构方法

### 1. 搬移函数 (Move Method)
将函数移动到它最常访问的对象中。

### 2. 提取函数 (Extract Method)
将依恋的部分提取为独立的函数。

### 3. 内联函数 (Inline Method)
如果函数很小，直接内联到调用处。

### 4. 隐藏委托 (Hide Delegate)
通过委托来隐藏直接的访问。

### 5. 移除中间人 (Remove Middle Man)
如果中间人没有实际价值，直接移除。

## 实际案例

### 重构前代码

```javascript
class Order {
  constructor(customer, items) {
    this.customer = customer;
    this.items = items;
    this.total = 0;
  }
  
  calculateTotal() {
    let total = 0;
    for (const item of this.items) {
      total += item.price * item.quantity;
    }
    this.total = total;
    return total;
  }
}

class Customer {
  constructor(name, email, loyaltyPoints) {
    this.name = name;
    this.email = email;
    this.loyaltyPoints = loyaltyPoints;
  }
  
  // 这个方法更多地使用Order的数据而不是Customer的数据
  generateOrderSummary(order) {
    // 频繁访问Order对象的字段
    const itemsCount = order.items.length;
    const totalAmount = order.total;
    const itemDescriptions = order.items.map(item => 
      `${item.name} x ${item.quantity}`
    ).join(', ');
    
    // 使用Customer自己的数据很少
    const summary = `
      订单摘要 - 客户: ${this.name}
      商品数量: ${itemsCount}
      总金额: ¥${totalAmount}
      商品列表: ${itemDescriptions}
      可用积分: ${this.loyaltyPoints}
    `;
    
    return summary;
  }
  
  // 另一个依恋情结的例子
  applyDiscountToOrder(order) {
    // 根据客户积分计算折扣
    const discountRate = this.calculateDiscountRate();
    const discountAmount = order.total * discountRate;
    order.total -= discountAmount;
    
    return discountAmount;
  }
  
  calculateDiscountRate() {
    if (this.loyaltyPoints > 1000) return 0.1;
    if (this.loyaltyPoints > 500) return 0.05;
    return 0;
  }
}

// 使用示例
const customer = new Customer('张三', 'zhangsan@example.com', 750);
const order = new Order(customer, [
  { name: '手机', price: 2999, quantity: 1 },
  { name: '耳机', price: 299, quantity: 2 }
]);

order.calculateTotal();
const summary = customer.generateOrderSummary(order);  // 依恋情结
const discount = customer.applyDiscountToOrder(order); // 依恋情结
```

### 重构后代码

```javascript
class Order {
  constructor(customer, items) {
    this.customer = customer;
    this.items = items;
    this.total = 0;
    this.discountAmount = 0;
  }
  
  calculateTotal() {
    let total = 0;
    for (const item of this.items) {
      total += item.price * item.quantity;
    }
    this.total = total;
    return total;
  }
  
  // 将依恋的函数搬移到Order类中
  generateSummary() {
    const itemsCount = this.items.length;
    const itemDescriptions = this.items.map(item => 
      `${item.name} x ${item.quantity}`
    ).join(', ');
    
    const summary = `
      订单摘要 - 客户: ${this.customer.name}
      商品数量: ${itemsCount}
      总金额: ¥${this.total}
      折扣金额: ¥${this.discountAmount}
      实付金额: ¥${this.getFinalAmount()}
      商品列表: ${itemDescriptions}
      客户积分: ${this.customer.loyaltyPoints}
    `;
    
    return summary;
  }
  
  // 将折扣应用逻辑搬移到Order类中
  applyCustomerDiscount() {
    const discountRate = this.customer.calculateDiscountRate();
    this.discountAmount = this.total * discountRate;
    return this.discountAmount;
  }
  
  getFinalAmount() {
    return this.total - this.discountAmount;
  }
  
  // 添加其他订单相关的功能
  getItemsCount() {
    return this.items.length;
  }
  
  getItemNames() {
    return this.items.map(item => item.name);
  }
}

class Customer {
  constructor(name, email, loyaltyPoints) {
    this.name = name;
    this.email = email;
    this.loyaltyPoints = loyaltyPoints;
  }
  
  // 只保留客户相关的功能
  calculateDiscountRate() {
    if (this.loyaltyPoints > 1000) return 0.1;
    if (this.loyaltyPoints > 500) return 0.05;
    return 0;
  }
  
  addLoyaltyPoints(points) {
    this.loyaltyPoints += points;
  }
  
  // 客户自己的业务逻辑
  getLoyaltyLevel() {
    if (this.loyaltyPoints > 1000) return 'VIP';
    if (this.loyaltyPoints > 500) return '高级';
    return '普通';
  }
}

// 使用示例
const customer = new Customer('张三', 'zhangsan@example.com', 750);
const order = new Order(customer, [
  { name: '手机', price: 2999, quantity: 1 },
  { name: '耳机', price: 299, quantity: 2 }
]);

order.calculateTotal();
order.applyCustomerDiscount();
const summary = order.generateSummary();  // 现在在正确的类中
```

## 课后练习

1. **依恋识别**：找出你项目中存在依恋情结的函数
2. **函数搬移**：将函数移动到最合适的类中
3. **接口设计**：设计清晰的接口来减少不必要的访问
4. **数据封装**：通过方法而不是直接字段访问来封装数据

**练习代码**：
```javascript
// 重构以下代码，解决依恋情结问题
class ReportGenerator {
  generateUserReport(user, orders) {
    // 这个函数过度访问Order对象的数据
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const favoriteCategory = this.findFavoriteCategory(orders);
    
    return `
      用户报告: ${user.name}
      订单总数: ${totalOrders}
      总消费额: ¥${totalSpent}
      最喜欢类别: ${favoriteCategory}
      注册时间: ${user.createdAt}
    `;
  }
  
  findFavoriteCategory(orders) {
    // 复杂的订单数据分析逻辑
    const categoryCount = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });
    });
    
    return Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b
    );
  }
}

class User {
  constructor(name, createdAt) {
    this.name = name;
    this.createdAt = createdAt;
  }
}

class Order {
  constructor(items, total) {
    this.items = items;
    this.total = total;
  }
}