# 6. 霰弹式修改 (Shotgun Surgery)

霰弹式修改是指一个变化需要修改多个类。

## 问题定义

当需要对代码进行一个修改时，发现需要在多个不同的类中进行相应的修改，就出现了霰弹式修改的坏味道。这表明相关的逻辑被分散在多个地方。

## 典型症状

1. **修改点分散**：一个变化需要在多个地方修改
2. **修改一致性难保**：容易遗漏某些修改点
3. **测试困难**：需要测试多个修改点
4. **版本控制冲突**：多人修改时容易产生冲突
5. **部署风险高**：遗漏修改可能导致系统故障

## 重构方法

### 1. 搬移函数 (Move Method)
将相关的函数移动到同一个类中。

### 2. 搬移字段 (Move Field)
将相关的字段移动到同一个类中。

### 3. 内联类 (Inline Class)
将多个相关的类合并为一个类。

### 4. 引入参数对象 (Introduce Parameter Object)
使用参数对象来统一参数传递。

### 5. 用多态替代条件表达式 (Replace Conditional with Polymorphism)
使用多态来消除分散的条件判断。

## 实际案例

### 重构前代码

```javascript
// 用户类
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  
  // 验证用户名（需要在多个地方维护验证规则）
  validateName() {
    if (!this.name || this.name.length < 2) {
      throw new Error('用户名至少2个字符');
    }
    if (this.name.length > 50) {
      throw new Error('用户名不能超过50个字符');
    }
  }
}

// 产品类
class Product {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
  
  // 验证产品名（重复的验证逻辑）
  validateName() {
    if (!this.name || this.name.length < 2) {
      throw new Error('产品名至少2个字符');
    }
    if (this.name.length > 100) {
      throw new Error('产品名不能超过100个字符');
    }
  }
}

// 订单类
class Order {
  constructor(description) {
    this.description = description;
  }
  
  // 验证订单描述（又一套验证规则）
  validateDescription() {
    if (!this.description || this.description.length < 5) {
      throw new Error('订单描述至少5个字符');
    }
    if (this.description.length > 500) {
      throw new Error('订单描述不能超过500个字符');
    }
  }
}

// 使用示例
const user = new User('张三', 'zhangsan@example.com');
user.validateName();  // 需要修改验证规则时，要改这里

const product = new Product('智能手机', 2999);
product.validateName();  // 还要改这里

const order = new Order('购买智能手机订单');
order.validateDescription();  // 这里也要改
```

### 重构后代码

```javascript
// 统一的验证器类
class Validator {
  // 字符串验证规则
  static validateString(value, options = {}) {
    const { minLength = 1, maxLength = 255, fieldName = '字段' } = options;
    
    if (!value && value !== '') {
      throw new Error(`${fieldName}不能为空`);
    }
    
    if (value.length < minLength) {
      throw new Error(`${fieldName}至少${minLength}个字符`);
    }
    
    if (value.length > maxLength) {
      throw new Error(`${fieldName}不能超过${maxLength}个字符`);
    }
    
    return true;
  }
  
  // 邮箱验证
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('邮箱格式不正确');
    }
    return true;
  }
  
  // 数字验证
  static validateNumber(value, options = {}) {
    const { min = 0, max = Number.MAX_SAFE_INTEGER, fieldName = '数值' } = options;
    
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${fieldName}必须是有效数字`);
    }
    
    if (value < min) {
      throw new Error(`${fieldName}不能小于${min}`);
    }
    
    if (value > max) {
      throw new Error(`${fieldName}不能大于${max}`);
    }
    
    return true;
  }
}

// 重构后的用户类
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  
  validate() {
    Validator.validateString(this.name, { 
      minLength: 2, 
      maxLength: 50, 
      fieldName: '用户名' 
    });
    Validator.validateEmail(this.email);
    return true;
  }
}

// 重构后的产品类
class Product {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
  
  validate() {
    Validator.validateString(this.name, { 
      minLength: 2, 
      maxLength: 100, 
      fieldName: '产品名' 
    });
    Validator.validateNumber(this.price, { 
      min: 0, 
      fieldName: '价格' 
    });
    return true;
  }
}

// 重构后的订单类
class Order {
  constructor(description) {
    this.description = description;
  }
  
  validate() {
    Validator.validateString(this.description, { 
      minLength: 5, 
      maxLength: 500, 
      fieldName: '订单描述' 
    });
    return true;
  }
}

// 使用示例
const user = new User('张三', 'zhangsan@example.com');
user.validate();  // 修改验证规则只需要改Validator类

const product = new Product('智能手机', 2999);
product.validate();

const order = new Order('购买智能手机订单');
order.validate();
```

## 课后练习

1. **修改点分析**：找出你项目中需要多处修改的功能
2. **逻辑集中**：将分散的逻辑集中到统一的类或函数中
3. **配置化**：使用配置来管理可变的规则
4. **模板模式**：使用模板模式来处理相似的流程

**练习代码**：
```javascript
// 重构以下代码，解决霰弹式修改问题
class UserService {
  createUser(userData) {
    // 验证逻辑（与ProductService中的验证重复）
    if (!userData.name || userData.name.length < 2) {
      throw new Error('用户名无效');
    }
    // 创建用户逻辑...
  }
}

class ProductService {
  createProduct(productData) {
    // 验证逻辑（与UserService中的验证重复）
    if (!productData.name || productData.name.length < 2) {
      throw new Error('产品名无效');
    }
    // 创建产品逻辑...
  }
}

class OrderService {
  createOrder(orderData) {
    // 验证逻辑（又是一套验证规则）
    if (!orderData.description || orderData.description.length < 5) {
      throw new Error('订单描述无效');
    }
    // 创建订单逻辑...
  }
}