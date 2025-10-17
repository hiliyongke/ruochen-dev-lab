# 9. 基本类型偏执 (Primitive Obsession)

基本类型偏执是指过度使用基本类型而不是对象。

## 问题定义

当开发者过度使用基本数据类型（如字符串、数字、布尔值）来表示概念，而不是创建专门的类或对象时，就出现了基本类型偏执的坏味道。这导致业务逻辑分散在代码各处。

## 典型症状

1. **字符串滥用**：用字符串表示复杂概念
2. **数字误用**：用数字表示枚举或状态
3. **布尔值泛滥**：用多个布尔值表示复杂状态
4. **验证逻辑分散**：验证逻辑重复出现在多个地方
5. **业务逻辑缺失**：缺乏专门的对象来封装业务规则

## 重构方法

### 1. 用对象替换数据值 (Replace Data Value with Object)
将基本类型替换为专门的对象。

### 2. 用类替换类型代码 (Replace Type Code with Class)
用类来替换类型代码。

### 3. 用子类替换类型代码 (Replace Type Code with Subclasses)
用子类来替换类型代码。

### 4. 用状态/策略模式替换类型代码 (Replace Type Code with State/Strategy)
用状态模式或策略模式来替换类型代码。

### 5. 用多态替代条件表达式 (Replace Conditional with Polymorphism)
用多态来消除条件判断。

## 实际案例

### 重构前代码

```javascript
// 基本类型偏执的典型例子
class User {
  constructor(name, email, phone, status) {
    this.name = name;           // 字符串
    this.email = email;         // 字符串
    this.phone = phone;         // 字符串
    this.status = status;       // 字符串表示状态: 'active', 'inactive', 'banned'
  }
  
  // 验证逻辑分散在各处
  validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
  
  validatePhone() {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(this.phone);
  }
  
  // 使用字符串进行状态判断
  isActive() {
    return this.status === 'active';
  }
  
  canLogin() {
    return this.status === 'active' || this.status === 'inactive';
  }
  
  // 更多的字符串操作
  getStatusText() {
    const statusMap = {
      'active': '活跃',
      'inactive': '非活跃', 
      'banned': '已禁用'
    };
    return statusMap[this.status] || '未知';
  }
}

class Order {
  constructor(id, amount, currency, status) {
    this.id = id;
    this.amount = amount;       // 数字
    this.currency = currency;   // 字符串: 'CNY', 'USD', 'EUR'
    this.status = status;       // 字符串: 'pending', 'paid', 'shipped', 'delivered'
  }
  
  // 重复的验证逻辑
  isValidAmount() {
    return this.amount > 0 && this.amount < 1000000;
  }
  
  // 字符串比较
  isPaid() {
    return this.status === 'paid';
  }
  
  canCancel() {
    return this.status === 'pending' || this.status === 'paid';
  }
  
  // 货币转换逻辑分散
  convertTo(targetCurrency) {
    const rates = {
      'CNY': { 'USD': 0.14, 'EUR': 0.13 },
      'USD': { 'CNY': 7.0, 'EUR': 0.93 },
      'EUR': { 'CNY': 7.7, 'USD': 1.07 }
    };
    
    if (this.currency === targetCurrency) return this.amount;
    return this.amount * rates[this.currency][targetCurrency];
  }
}

// 使用示例
const user = new User('张三', 'zhangsan@example.com', '13800138000', 'active');
if (user.validateEmail() && user.validatePhone() && user.isActive()) {
  console.log('用户可以登录');
}

const order = new Order('ORDER123', 100, 'CNY', 'pending');
if (order.isValidAmount() && order.canCancel()) {
  console.log('订单可以取消');
}
```

### 重构后代码

```javascript
// 创建专门的值对象来替换基本类型

// 邮箱值对象
class Email {
  constructor(value) {
    if (!Email.isValid(value)) {
      throw new Error('无效的邮箱地址');
    }
    this.value = value;
  }
  
  static isValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  getDomain() {
    return this.value.split('@')[1];
  }
  
  getLocalPart() {
    return this.value.split('@')[0];
  }
  
  toString() {
    return this.value;
  }
}

// 手机号值对象
class PhoneNumber {
  constructor(value) {
    if (!PhoneNumber.isValid(value)) {
      throw new Error('无效的手机号码');
    }
    this.value = value;
  }
  
  static isValid(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }
  
  getAreaCode() {
    return this.value.substring(0, 3);
  }
  
  toString() {
    return this.value;
  }
}

// 用户状态枚举类
class UserStatus {
  static ACTIVE = new UserStatus('active', '活跃');
  static INACTIVE = new UserStatus('inactive', '非活跃');
  static BANNED = new UserStatus('banned', '已禁用');
  
  constructor(code, description) {
    this.code = code;
    this.description = description;
  }
  
  canLogin() {
    return this === UserStatus.ACTIVE || this === UserStatus.INACTIVE;
  }
  
  toString() {
    return this.description;
  }
  
  static fromCode(code) {
    const statusMap = {
      'active': UserStatus.ACTIVE,
      'inactive': UserStatus.INACTIVE,
      'banned': UserStatus.BANNED
    };
    return statusMap[code] || null;
  }
}

// 货币值对象
class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = new Currency(currency);
  }
  
  isValid() {
    return this.amount > 0 && this.amount < 1000000;
  }
  
  convertTo(targetCurrency) {
    const target = new Currency(targetCurrency);
    return this.currency.convert(this.amount, target);
  }
  
  add(other) {
    if (this.currency.equals(other.currency)) {
      return new Money(this.amount + other.amount, this.currency.code);
    }
    const converted = other.convertTo(this.currency.code);
    return new Money(this.amount + converted.amount, this.currency.code);
  }
  
  toString() {
    return `${this.currency.symbol}${this.amount.toFixed(2)}`;
  }
}

// 货币类
class Currency {
  constructor(code) {
    this.code = code;
    this.symbol = this.getSymbol();
  }
  
  getSymbol() {
    const symbols = {
      'CNY': '¥',
      'USD': '$',
      'EUR': '€'
    };
    return symbols[this.code] || this.code;
  }
  
  convert(amount, targetCurrency) {
    const rates = this.getExchangeRates();
    const rate = rates[targetCurrency.code];
    return new Money(amount * rate, targetCurrency.code);
  }
  
  getExchangeRates() {
    const rates = {
      'CNY': { 'USD': 0.14, 'EUR': 0.13 },
      'USD': { 'CNY': 7.0, 'EUR': 0.93 },
      'EUR': { 'CNY': 7.7, 'USD': 1.07 }
    };
    return rates[this.code] || {};
  }
  
  equals(other) {
    return this.code === other.code;
  }
}

// 订单状态类
class OrderStatus {
  static PENDING = new OrderStatus('pending', '待支付');
  static PAID = new OrderStatus('paid', '已支付');
  static SHIPPED = new OrderStatus('shipped', '已发货');
  static DELIVERED = new OrderStatus('delivered', '已送达');
  
  constructor(code, description) {
    this.code = code;
    this.description = description;
  }
  
  canCancel() {
    return this === OrderStatus.PENDING || this === OrderStatus.PAID;
  }
  
  toString() {
    return this.description;
  }
}

// 重构后的User类
class User {
  constructor(name, email, phone, status) {
    this.name = name;
    this.email = new Email(email);
    this.phone = new PhoneNumber(phone);
    this.status = UserStatus.fromCode(status);
  }
  
  canLogin() {
    return this.status.canLogin();
  }
  
  // 方法变得简洁
  getContactInfo() {
    return {
      email: this.email.toString(),
      phone: this.phone.toString(),
      domain: this.email.getDomain()
    };
  }
}

// 重构后的Order类
class Order {
  constructor(id, amount, currency, status) {
    this.id = id;
    this.amount = new Money(amount, currency);
    this.status = status;
  }
  
  canCancel() {
    return this.status.canCancel();
  }
  
  // 添加业务逻辑
  applyDiscount(percent) {
    const discountAmount = this.amount.amount * (percent / 100);
    return new Money(this.amount.amount - discountAmount, this.amount.currency.code);
  }
}

// 使用示例
try {
  const user = new User('张三', 'zhangsan@example.com', '13800138000', 'active');
  if (user.canLogin()) {
    console.log('用户可以登录');
    console.log(user.getContactInfo());
  }
  
  const order = new Order('ORDER123', 100, 'CNY', OrderStatus.PENDING);
  if (order.canCancel()) {
    console.log('订单可以取消');
  }
  
  // 货币转换示例
  const money = new Money(100, 'CNY');
  const usdMoney = money.convertTo('USD');
  console.log(`100元人民币等于: ${usdMoney.toString()}`);
  
} catch (error) {
  console.error('创建对象失败:', error.message);
}
```

## 课后练习

1. **基本类型识别**：找出你项目中过度使用基本类型的地方
2. **值对象创建**：为常见概念创建专门的值对象
3. **业务逻辑封装**：在值对象中封装相关的业务逻辑
4. **验证集中**：将验证逻辑集中到值对象中

**练习代码**：
```javascript
// 重构以下代码，解决基本类型偏执问题
class Product {
  constructor(name, price, currency, weight, unit) {
    this.name = name;           // 字符串
    this.price = price;         // 数字
    this.currency = currency;   // 字符串
    this.weight = weight;       // 数字  
    this.unit = unit;          // 字符串
  }
  
  // 分散的验证逻辑
  isValidPrice() {
    return this.price > 0 && this.currency === 'CNY';
  }
  
  isValidWeight() {
    return this.weight > 0 && ['kg', 'g'].includes(this.unit);
  }
  
  // 字符串操作
  getPriceDisplay() {
    return `${this.currency}${this.price}`;
  }
  
  getWeightDisplay() {
    return `${this.weight}${this.unit}`;
  }
}