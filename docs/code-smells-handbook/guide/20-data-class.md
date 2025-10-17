# 20. 数据类 (Data Class)

数据类是指只有数据字段和简单的getter/setter方法，没有业务逻辑的类。

## 问题定义

当一个类只包含数据字段和简单的访问方法，没有任何业务逻辑时，就出现了数据类坏味道。这种类通常只是数据的容器，没有真正的行为。

## 典型症状

1. **只有数据**：类中只有字段和getter/setter
2. **没有行为**：没有业务逻辑方法
3. **贫血模型**：数据和行为分离
4. **过程式代码**：业务逻辑散落在其他地方
5. **维护困难**：数据和行为需要分开维护

## 重构方法

### 1. 搬移方法 (Move Method)
将相关业务逻辑移动到数据类中。

### 2. 提取方法 (Extract Method)
将散落的逻辑提取到数据类中。

### 3. 用对象替代数据值 (Replace Data Value with Object)
将简单数据值替换为有行为的对象。

### 4. 用子类替代类型代码 (Replace Type Code with Subclasses)
用多态处理不同的数据类型。

### 5. 引入领域模型 (Introduce Domain Model)
建立真正的领域模型。

## 实际案例

### 重构前代码

```javascript
// 数据类典型例子

// 纯粹的数据类 - 只有数据字段
class User {
  constructor(id, name, email, age, status, createdAt, lastLogin) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.age = age;
    this.status = status; // 'active', 'inactive', 'suspended'
    this.createdAt = createdAt;
    this.lastLogin = lastLogin;
  }
  
  // 只有getter/setter，没有业务逻辑
  getId() { return this.id; }
  getName() { return this.name; }
  getEmail() { return this.email; }
  getAge() { return this.age; }
  getStatus() { return this.status; }
  getCreatedAt() { return this.createdAt; }
  getLastLogin() { return this.lastLogin; }
  
  setName(name) { this.name = name; }
  setEmail(email) { this.email = email; }
  setAge(age) { this.age = age; }
  setStatus(status) { this.status = status; }
  setLastLogin(lastLogin) { this.lastLogin = lastLogin; }
}

// 业务逻辑散落在服务类中
class UserService {
  validateUser(user) {
    const errors = [];
    
    if (!user.getName() || user.getName().trim().length < 2) {
      errors.push('用户名至少需要2个字符');
    }
    
    if (!user.getEmail() || !user.getEmail().includes('@')) {
      errors.push('邮箱格式不正确');
    }
    
    if (user.getAge() < 0 || user.getAge() > 150) {
      errors.push('年龄必须在0-150之间');
    }
    
    if (!['active', 'inactive', 'suspended'].includes(user.getStatus())) {
      errors.push('状态值无效');
    }
    
    return errors.length === 0 ? null : errors;
  }
  
  canUserLogin(user) {
    return user.getStatus() === 'active' && 
           user.getLastLogin() && 
           new Date() - user.getLastLogin() < 30 * 24 * 60 * 60 * 1000; // 30天内登录过
  }
  
  shouldSendWelcomeEmail(user) {
    return user.getStatus() === 'active' && 
           new Date() - user.getCreatedAt() < 24 * 60 * 60 * 1000; // 创建24小时内
  }
  
  calculateUserLevel(user) {
    const age = user.getAge();
    if (age < 18) return 'junior';
    if (age < 60) return 'adult';
    return 'senior';
  }
  
  getUserStatistics(users) {
    const activeUsers = users.filter(u => u.getStatus() === 'active');
    const inactiveUsers = users.filter(u => u.getStatus() === 'inactive');
    const suspendedUsers = users.filter(u => u.getStatus() === 'suspended');
    
    const averageAge = users.reduce((sum, u) => sum + u.getAge(), 0) / users.length;
    const recentUsers = users.filter(u => 
      new Date() - u.getCreatedAt() < 30 * 24 * 60 * 60 * 1000
    );
    
    return {
      total: users.length,
      active: activeUsers.length,
      inactive: inactiveUsers.length,
      suspended: suspendedUsers.length,
      averageAge: Math.round(averageAge),
      recentUsers: recentUsers.length
    };
  }
}

// 订单数据类
class Order {
  constructor(id, userId, items, totalAmount, status, createdAt) {
    this.id = id;
    this.userId = userId;
    this.items = items; // [{productId, quantity, price}]
    this.totalAmount = totalAmount;
    this.status = status; // 'pending', 'paid', 'shipped', 'delivered', 'cancelled'
    this.createdAt = createdAt;
  }
  
  // 只有数据访问方法
  getId() { return this.id; }
  getUserId() { return this.userId; }
  getItems() { return this.items; }
  getTotalAmount() { return this.totalAmount; }
  getStatus() { return this.status; }
  getCreatedAt() { return this.createdAt; }
  
  setItems(items) { this.items = items; }
  setTotalAmount(amount) { this.totalAmount = amount; }
  setStatus(status) { this.status = status; }
}

// 订单服务类 - 业务逻辑散落
class OrderService {
  validateOrder(order) {
    const errors = [];
    
    if (!order.getUserId()) {
      errors.push('用户ID不能为空');
    }
    
    if (!order.getItems() || order.getItems().length === 0) {
      errors.push('订单商品不能为空');
    }
    
    const itemsValid = order.getItems().every(item => 
      item && item.productId && item.quantity > 0 && item.price >= 0
    );
    
    if (!itemsValid) {
      errors.push('订单商品信息无效');
    }
    
    const calculatedTotal = order.getItems().reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    if (Math.abs(calculatedTotal - order.getTotalAmount()) > 0.01) {
      errors.push('订单金额计算错误');
    }
    
    return errors.length === 0 ? null : errors;
  }
  
  canCancelOrder(order) {
    return ['pending', 'paid'].includes(order.getStatus());
  }
  
  canModifyOrder(order) {
    return order.getStatus() === 'pending';
  }
  
  calculateOrderDiscount(order, user) {
    let discount = 0;
    
    if (user.getAge() < 18) {
      discount = 0.1; // 未成年人9折
    } else if (user.getAge() > 60) {
      discount = 0.15; // 老年人85折
    }
    
    // VIP用户额外折扣
    if (user.getStatus() === 'active' && order.getTotalAmount() > 1000) {
      discount += 0.05;
    }
    
    return Math.min(discount, 0.3); // 最大折扣30%
  }
  
  getOrderSummary(order, user) {
    const discount = this.calculateOrderDiscount(order, user);
    const finalAmount = order.getTotalAmount() * (1 - discount);
    
    return {
      orderId: order.getId(),
      userName: user.getName(),
      itemCount: order.getItems().length,
      originalAmount: order.getTotalAmount(),
      discountRate: discount,
      discountAmount: order.getTotalAmount() * discount,
      finalAmount: finalAmount,
      status: order.getStatus(),
      canCancel: this.canCancelOrder(order),
      canModify: this.canModifyOrder(order)
    };
  }
}

// 使用示例 - 数据和行为分离
const userService = new UserService();
const orderService = new OrderService();

// 创建数据对象
const user = new User(1, '张三', 'zhangsan@example.com', 25, 'active', new Date(), new Date());
const order = new Order(101, 1, [
  { productId: 1, name: '商品A', price: 100, quantity: 2 },
  { productId: 2, name: '商品B', price: 50, quantity: 1 }
], 250, 'pending', new Date());

// 业务逻辑在服务类中
const userErrors = userService.validateUser(user);
console.log('用户验证结果:', userErrors);

const canLogin = userService.canUserLogin(user);
console.log('是否可以登录:', canLogin);

const orderErrors = orderService.validateOrder(order);
console.log('订单验证结果:', orderErrors);

const orderSummary = orderService.getOrderSummary(order, user);
console.log('订单摘要:', orderSummary);

// 问题：数据和行为分离，需要维护两个地方
```

### 重构后代码

```javascript
// 重构后的代码 - 将行为移动到数据类中

// 丰富的领域模型 - 包含数据和行为
class User {
  constructor(id, name, email, age, status = 'active', createdAt = new Date(), lastLogin = null) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.age = age;
    this.status = status;
    this.createdAt = createdAt;
    this.lastLogin = lastLogin;
  }
  
  // 业务逻辑方法 - 验证
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim().length < 2) {
      errors.push('用户名至少需要2个字符');
    }
    
    if (!this.email || !this.email.includes('@')) {
      errors.push('邮箱格式不正确');
    }
    
    if (this.age < 0 || this.age > 150) {
      errors.push('年龄必须在0-150之间');
    }
    
    if (!['active', 'inactive', 'suspended'].includes(this.status)) {
      errors.push('状态值无效');
    }
    
    return errors.length === 0 ? null : errors;
  }
  
  // 业务逻辑方法 - 登录相关
  canLogin() {
    return this.status === 'active' && 
           this.lastLogin && 
           new Date() - this.lastLogin < 30 * 24 * 60 * 60 * 1000;
  }
  
  shouldSendWelcomeEmail() {
    return this.status === 'active' && 
           new Date() - this.createdAt < 24 * 60 * 60 * 1000;
  }
  
  // 业务逻辑方法 - 用户级别
  getLevel() {
    if (this.age < 18) return 'junior';
    if (this.age < 60) return 'adult';
    return 'senior';
  }
  
  isEligibleForDiscount() {
    return this.status === 'active' && this.age >= 18;
  }
  
  // 业务逻辑方法 - 状态管理
  activate() {
    this.status = 'active';
    this.lastLogin = new Date();
  }
  
  deactivate() {
    this.status = 'inactive';
  }
  
  suspend() {
    this.status = 'suspended';
  }
  
  // 业务逻辑方法 - 数据转换
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      age: this.age,
      status: this.status,
      level: this.getLevel(),
      createdAt: this.createdAt,
      lastLogin: this.lastLogin,
      canLogin: this.canLogin(),
      shouldSendWelcomeEmail: this.shouldSendWelcomeEmail()
    };
  }
  
  // 静态工厂方法
  static createFromData(data) {
    return new User(
      data.id,
      data.name,
      data.email,
      data.age,
      data.status,
      new Date(data.createdAt),
      data.lastLogin ? new Date(data.lastLogin) : null
    );
  }
  
  // 领域服务方法 - 用户统计
  static getStatistics(users) {
    const activeUsers = users.filter(u => u.status === 'active');
    const inactiveUsers = users.filter(u => u.status === 'inactive');
    const suspendedUsers = users.filter(u => u.status === 'suspended');
    
    const averageAge = users.reduce((sum, u) => sum + u.age, 0) / users.length;
    const recentUsers = users.filter(u => 
      new Date() - u.createdAt < 30 * 24 * 60 * 60 * 1000
    );
    
    return {
      total: users.length,
      active: activeUsers.length,
      inactive: inactiveUsers.length,
      suspended: suspendedUsers.length,
      averageAge: Math.round(averageAge),
      recentUsers: recentUsers.length,
      levels: {
        junior: users.filter(u => u.getLevel() === 'junior').length,
        adult: users.filter(u => u.getLevel() === 'adult').length,
        senior: users.filter(u => u.getLevel() === 'senior').length
      }
    };
  }
}

// 丰富的订单领域模型
class Order {
  constructor(id, userId, items, totalAmount, status = 'pending', createdAt = new Date()) {
    this.id = id;
    this.userId = userId;
    this.items = items;
    this.totalAmount = totalAmount;
    this.status = status;
    this.createdAt = createdAt;
  }
  
  // 业务逻辑方法 - 验证
  validate() {
    const errors = [];
    
    if (!this.userId) {
      errors.push('用户ID不能为空');
    }
    
    if (!this.items || this.items.length === 0) {
      errors.push('订单商品不能为空');
    }
    
    const itemsValid = this.items.every(item => 
      item && item.productId && item.quantity > 0 && item.price >= 0
    );
    
    if (!itemsValid) {
      errors.push('订单商品信息无效');
    }
    
    const calculatedTotal = this.calculateSubtotal();
    if (Math.abs(calculatedTotal - this.totalAmount) > 0.01) {
      errors.push('订单金额计算错误');
    }
    
    return errors.length === 0 ? null : errors;
  }
  
  // 业务逻辑方法 - 金额计算
  calculateSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  
  recalculateTotal() {
    this.totalAmount = this.calculateSubtotal();
    return this.totalAmount;
  }
  
  // 业务逻辑方法 - 状态管理
  canCancel() {
    return ['pending', 'paid'].includes(this.status);
  }
  
  canModify() {
    return this.status === 'pending';
  }
  
  markAsPaid() {
    if (this.status === 'pending') {
      this.status = 'paid';
      return true;
    }
    return false;
  }
  
  markAsShipped() {
    if (this.status === 'paid') {
      this.status = 'shipped';
      return true;
    }
    return false;
  }
  
  markAsDelivered() {
    if (this.status === 'shipped') {
      this.status = 'delivered';
      return true;
    }
    return false;
  }
  
  cancel() {
    if (this.canCancel()) {
      this.status = 'cancelled';
      return true;
    }
    return false;
  }
  
  // 业务逻辑方法 - 折扣计算
  calculateDiscount(user) {
    if (!user || !user.isEligibleForDiscount()) {
      return 0;
    }
    
    let discount = 0;
    
    // 基于用户年龄的折扣
    if (user.age < 18) {
      discount = 0.1; // 未成年人9折
    } else if (user.age > 60) {
      discount = 0.15; // 老年人85折
    }
    
    // 基于订单金额的折扣
    if (this.totalAmount > 1000) {
      discount += 0.05;
    }
    
    // 基于用户级别的折扣
    const levelDiscounts = {
      junior: 0.05,
      adult: 0.02,
      senior: 0.1
    };
    discount += levelDiscounts[user.getLevel()] || 0;
    
    return Math.min(discount, 0.3); // 最大折扣30%
  }
  
  getFinalAmount(user) {
    const discount = this.calculateDiscount(user);
    return this.totalAmount * (1 - discount);
  }
  
  // 业务逻辑方法 - 订单摘要
  getSummary(user = null) {
    const discount = user ? this.calculateDiscount(user) : 0;
    const finalAmount = user ? this.getFinalAmount(user) : this.totalAmount;
    
    return {
      orderId: this.id,
      userId: this.userId,
      itemCount: this.items.length,
      originalAmount: this.totalAmount,
      discountRate: discount,
      discountAmount: this.totalAmount * discount,
      finalAmount: finalAmount,
      status: this.status,
      canCancel: this.canCancel(),
      canModify: this.canModify(),
      createdAt: this.createdAt
    };
  }
  
  // 业务逻辑方法 - 商品管理
  addItem(productId, name, price, quantity) {
    if (!this.canModify()) {
      throw new Error('订单不能修改');
    }
    
    this.items.push({ productId, name, price, quantity });
    this.recalculateTotal();
  }
  
  removeItem(productId) {
    if (!this.canModify()) {
      throw new Error('订单不能修改');
    }
    
    this.items = this.items.filter(item => item.productId !== productId);
    this.recalculateTotal();
  }
  
  updateItemQuantity(productId, quantity) {
    if (!this.canModify()) {
      throw new Error('订单不能修改');
    }
    
    const item = this.items.find(item => item.productId === productId);
    if (item) {
      item.quantity = quantity;
      this.recalculateTotal();
    }
  }
  
  // 数据转换方法
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      items: this.items,
      totalAmount: this.totalAmount,
      status: this.status,
      createdAt: this.createdAt,
      canCancel: this.canCancel(),
      canModify: this.canModify()
    };
  }
  
  // 静态工厂方法
  static createFromData(data) {
    return new Order(
      data.id,
      data.userId,
      data.items,
      data.totalAmount,
      data.status,
      new Date(data.createdAt)
    );
  }
}

// 使用示例 - 丰富的领域模型
const user = new User(1, '张三', 'zhangsan@example.com', 25);
const order = new Order(101, 1, [
  { productId: 1, name: '商品A', price: 100, quantity: 2 },
  { productId: 2, name: '商品B', price: 50, quantity: 1 }
], 250);

// 业务逻辑在领域对象中
const userErrors = user.validate();
console.log('用户验证结果:', userErrors);

const canLogin = user.canLogin();
console.log('是否可以登录:', canLogin);

const orderErrors = order.validate();
console.log('订单验证结果:', orderErrors);

// 使用订单的业务逻辑
order.markAsPaid();
const orderSummary = order.getSummary(user);
console.log('订单摘要:', orderSummary);

// 添加商品（使用订单的业务逻辑）
order.addItem(3, '商品C', 75, 1);
console.log('添加商品后的订单:', order.getSummary(user));

// 用户统计（静态方法）
const users = [
  new User(1, '张三', 'zhangsan@example.com', 25),
  new User(2, '李四', 'lisi@example.com', 17),
  new User(3, '王五', 'wangwu@example.com', 65)
];

const statistics = User.getStatistics(users);
console.log('用户统计:', statistics);

// 2. 使用值对象处理复杂数据
class Money {
  constructor(amount, currency = 'CNY') {
    this.amount = amount;
    this.currency = currency;
  }
  
  // 业务逻辑方法
  add(other) {
    if (this.currency !== other.currency) {
      throw new Error('货币类型不匹配');
    }
    return new Money(this.amount + other.amount, this.currency);
  }
  
  subtract(other) {
    if (this.currency !== other.currency) {
      throw new Error('货币类型不匹配');
    }
    return new Money(this.amount - other.amount, this.currency);
  }
  
  multiply(factor) {
    return new Money(this.amount * factor, this.currency);
  }
  
  format() {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
  
  isPositive() {
    return this.amount > 0;
  }
  
  isZero() {
    return this.amount === 0;
  }
  
  compareTo(other) {
    if (this.currency !== other.currency) {
      throw new Error('货币类型不匹配');
    }
    return this.amount - other.amount;
  }
}

// 在订单中使用值对象
class RichOrder {
  constructor(id, userId, items, totalAmount, currency = 'CNY') {
    this.id = id;
    this.userId = userId;
    this.items = items;
    this.totalAmount = new Money(totalAmount, currency);
    this.status = 'pending';
    this.createdAt = new Date();
  }
  
  calculateSubtotal() {
    return this.items.reduce((sum, item) => 
      sum.add(new Money(item.price * item.quantity, this.totalAmount.currency)),
      new Money(0, this.totalAmount.currency)
    );
  }
  
  applyDiscount(discountRate) {
    const discountAmount = this.totalAmount.multiply(discountRate);
    this.totalAmount = this.totalAmount.subtract(discountAmount);
    return discountAmount;
  }
}

// 使用值对象
const richOrder = new RichOrder(102, 1, [
  { productId: 1, name: '商品A', price: 100, quantity: 2 }
], 200);

const subtotal = richOrder.calculateSubtotal();
console.log('小计:', subtotal.format());

const discount = richOrder.applyDiscount(0.1);
console.log('折扣:', discount.format());
console.log('最终金额:', richOrder.totalAmount.format());
```

## 课后练习

1. **数据类识别**：找出项目中的数据类
2. **行为搬移**：将相关业务逻辑移动到数据类中
3. **值对象设计**：设计有行为的值对象
4. **领域建模**：建立丰富的领域模型

**练习代码**：
```javascript
// 重构以下数据类，添加业务逻辑
class Product {
  constructor(id, name, price, category) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.category = category;
  }
}