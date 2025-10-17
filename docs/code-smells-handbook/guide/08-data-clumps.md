# 8. 数据泥团 (Data Clumps)

数据泥团是指总是绑在一起出现的数据项。

## 问题定义

当一组数据项（如多个参数或字段）总是同时出现、同时被传递、同时被使用时，就出现了数据泥团的坏味道。这些数据项应该被组合成一个单独的对象。

## 典型症状

1. **同时出现**：一组数据总是同时出现
2. **参数捆绑**：多个参数总是被一起传递
3. **字段组合**：多个字段总是被一起使用
4. **重复定义**：相同的数据组合在多个地方定义
5. **修改困难**：修改一个数据项需要修改多个地方

## 重构方法

### 1. 引入参数对象 (Introduce Parameter Object)
将相关的参数组合成一个参数对象。

### 2. 保持完整对象 (Preserve Whole Object)
传递整个对象而不是对象的各个属性。

### 3. 提取类 (Extract Class)
将相关的字段提取到一个新的类中。

### 4. 内联类 (Inline Class)
如果类太小，直接内联到使用处。

### 5. 用对象替换数据值 (Replace Data Value with Object)
将基本类型的数据值替换为对象。

## 实际案例

### 重构前代码

```javascript
// 数据泥团的典型例子 - 地址信息总是绑在一起出现
class User {
  constructor(name, street, city, state, zipCode, country) {
    this.name = name;
    this.street = street;     // 地址数据泥团
    this.city = city;         // 地址数据泥团  
    this.state = state;       // 地址数据泥团
    this.zipCode = zipCode;   // 地址数据泥团
    this.country = country;   // 地址数据泥团
  }
  
  // 多个方法都使用相同的数据组合
  getFullAddress() {
    return `${this.street}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
  }
  
  validateAddress() {
    return this.street && this.city && this.state && this.zipCode && this.country;
  }
  
  // 另一个数据泥团 - 联系信息
  updateContactInfo(phone, email, wechat) {
    this.phone = phone;       // 联系数据泥团
    this.email = email;       // 联系数据泥团
    this.wechat = wechat;     // 联系数据泥团
  }
}

class Order {
  constructor(orderId, shippingStreet, shippingCity, shippingState, shippingZipCode, shippingCountry) {
    this.orderId = orderId;
    this.shippingStreet = shippingStreet;     // 重复的数据泥团
    this.shippingCity = shippingCity;         // 重复的数据泥团
    this.shippingState = shippingState;       // 重复的数据泥团
    this.shippingZipCode = shippingZipCode;  // 重复的数据泥团
    this.shippingCountry = shippingCountry;  // 重复的数据泥团
  }
  
  // 重复的地址处理方法
  getShippingAddress() {
    return `${this.shippingStreet}, ${this.shippingCity}, ${this.shippingState} ${this.shippingZipCode}, ${this.shippingCountry}`;
  }
}

// 函数参数中的数据泥团
function calculateShippingCost(originStreet, originCity, originState, originZipCode, originCountry,
                             destStreet, destCity, destState, destZipCode, destCountry, weight) {
  // 复杂的物流计算逻辑，使用两组地址数据泥团
  console.log(`从 ${originCity} 到 ${destCity}`);
  return 10; // 简化计算
}

// 调用时参数冗长
const cost = calculateShippingCost(
  '人民路123号', '北京市', '北京', '100000', '中国',
  '南京路456号', '上海市', '上海', '200000', '中国',
  2.5
);
```

### 重构后代码

```javascript
// 提取地址类来解决数据泥团
class Address {
  constructor(street, city, state, zipCode, country) {
    this.street = street;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
    this.country = country;
  }
  
  getFullAddress() {
    return `${this.street}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
  }
  
  validate() {
    return this.street && this.city && this.state && this.zipCode && this.country;
  }
  
  // 添加地址相关的业务逻辑
  isDomestic() {
    return this.country === '中国';
  }
  
  getRegion() {
    return `${this.state}-${this.city}`;
  }
  
  // 静态方法创建常用地址
  static createDomesticAddress(street, city, state, zipCode) {
    return new Address(street, city, state, zipCode, '中国');
  }
}

// 提取联系信息类
class ContactInfo {
  constructor(phone, email, wechat = '') {
    this.phone = phone;
    this.email = email;
    this.wechat = wechat;
  }
  
  validate() {
    return this.phone && this.email;
  }
  
  getPrimaryContact() {
    return this.phone || this.email;
  }
}

// 重构后的User类
class User {
  constructor(name, address, contactInfo) {
    this.name = name;
    this.address = address;        // 使用Address对象
    this.contactInfo = contactInfo; // 使用ContactInfo对象
  }
  
  // 方法变得简洁
  getFullAddress() {
    return this.address.getFullAddress();
  }
  
  validateAddress() {
    return this.address.validate();
  }
  
  // 添加用户相关逻辑
  isDomesticUser() {
    return this.address.isDomestic();
  }
}

// 重构后的Order类
class Order {
  constructor(orderId, shippingAddress) {
    this.orderId = orderId;
    this.shippingAddress = shippingAddress;  // 使用Address对象
  }
  
  getShippingAddress() {
    return this.shippingAddress.getFullAddress();
  }
  
  // 添加订单相关逻辑
  isDomesticOrder() {
    return this.shippingAddress.isDomestic();
  }
}

// 重构后的物流计算函数
class ShippingCalculator {
  static calculateCost(originAddress, destAddress, weight) {
    // 使用Address对象，参数变得简洁
    console.log(`从 ${originAddress.city} 到 ${destAddress.city}`);
    
    // 基于地址的复杂计算逻辑
    const baseRate = this.getBaseRate(originAddress, destAddress);
    const weightMultiplier = this.getWeightMultiplier(weight);
    
    return baseRate * weightMultiplier;
  }
  
  static getBaseRate(origin, destination) {
    // 基于地址的费率计算
    if (origin.country !== destination.country) {
      return 50; // 国际运费
    }
    if (origin.state !== destination.state) {
      return 15; // 跨省运费
    }
    return 8; // 省内运费
  }
  
  static getWeightMultiplier(weight) {
    return Math.max(1, weight / 0.5);
  }
}

// 使用示例
const userAddress = new Address('人民路123号', '北京市', '北京', '100000', '中国');
const userContact = new ContactInfo('13800138000', 'zhangsan@example.com', 'zhangsan123');
const user = new User('张三', userAddress, userContact);

const orderAddress = new Address('南京路456号', '上海市', '上海', '200000', '中国');
const order = new Order('ORDER123', orderAddress);

const cost = ShippingCalculator.calculateCost(userAddress, orderAddress, 2.5);

console.log(user.getFullAddress()); // 人民路123号, 北京市, 北京 100000, 中国
console.log(order.getShippingAddress()); // 南京路456号, 上海市, 上海 200000, 中国
console.log(`运费: ¥${cost}`);
```

## 课后练习

1. **数据泥团识别**：找出你项目中总是绑在一起出现的数据项
2. **对象提取**：将数据泥团提取为专门的对象或类
3. **参数简化**：使用参数对象来简化函数签名
4. **业务逻辑封装**：在提取的对象中添加相关的业务逻辑

**练习代码**：
```javascript
// 重构以下代码，解决数据泥团问题
class Product {
  constructor(name, category, price, currency, weight, unit) {
    this.name = name;
    this.category = category;
    this.price = price;         // 价格数据泥团
    this.currency = currency;   // 价格数据泥团
    this.weight = weight;      // 重量数据泥团  
    this.unit = unit;          // 重量数据泥团
  }
  
  // 多个方法使用相同的数据组合
  getPriceInfo() {
    return `${this.currency}${this.price}`;
  }
  
  getWeightInfo() {
    return `${this.weight}${this.unit}`;
  }
}

class ShoppingCart {
  addItem(product, quantity, price, currency, weight, unit) {
    // 参数中包含数据泥团
    this.items.push({
      product,
      quantity,
      price,      // 重复的数据
      currency,   // 重复的数据
      weight,     // 重复的数据
      unit       // 重复的数据
    });
  }
}