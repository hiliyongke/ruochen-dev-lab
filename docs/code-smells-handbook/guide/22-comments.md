# 22. 过多的注释 (Comments)

过多的注释是指代码中包含了过多的解释性注释，这些注释通常表明代码本身不够清晰。

## 问题定义

当代码需要大量注释来解释其功能时，就出现了过多的注释坏味道。好的代码应该自解释，注释应该用于解释"为什么"而不是"做什么"。

## 典型症状

1. **解释性注释**：注释解释代码在做什么
2. **注释代码**：被注释掉的代码块
3. **过时注释**：注释与代码不一致
4. **复杂注释**：需要注释来解释复杂逻辑
5. **注释依赖**：代码难以理解，依赖注释

## 重构方法

### 1. 提取方法 (Extract Method)
将复杂逻辑提取为有意义的函数名。

### 2. 重命名变量 (Rename Variable)
使用更具描述性的变量名。

### 3. 引入解释性变量 (Introduce Explaining Variable)
用变量名解释复杂表达式。

### 4. 用断言替代注释 (Replace Comment with Assertion)
用断言表达代码假设。

### 5. 删除注释代码 (Remove Commented Code)
删除不再需要的注释代码。

## 实际案例

### 重构前代码

```javascript
// 过多的注释典型例子

// 计算订单总金额的函数
function calculateOrderTotal(order) {
  // 检查订单是否有效
  if (!order || !order.items || order.items.length === 0) {
    // 如果订单无效，返回0
    return 0;
  }
  
  // 初始化总金额为0
  let total = 0;
  
  // 遍历订单中的所有商品
  for (let i = 0; i < order.items.length; i++) {
    // 获取当前商品
    const item = order.items[i];
    
    // 检查商品是否有效
    if (item && item.price && item.quantity) {
      // 计算商品小计：价格 × 数量
      const subtotal = item.price * item.quantity;
      
      // 将商品小计加到总金额中
      total += subtotal;
    }
  }
  
  // 应用折扣
  // 如果总金额大于1000，打9折
  if (total > 1000) {
    // 计算折扣后的金额
    total = total * 0.9;
  }
  
  // 应用税费
  // 税费率为8%
  const taxRate = 0.08;
  // 计算税费
  const tax = total * taxRate;
  // 将税费加到总金额中
  total += tax;
  
  // 返回最终总金额
  return total;
}

// 用户验证函数
function validateUser(user) {
  // 检查用户对象是否存在
  if (!user) {
    // 如果用户不存在，返回错误
    return { isValid: false, errors: ['用户不能为空'] };
  }
  
  // 初始化错误数组
  const errors = [];
  
  // 验证用户名
  // 用户名不能为空，且长度至少2个字符
  if (!user.username || user.username.trim().length < 2) {
    // 添加用户名错误
    errors.push('用户名至少需要2个字符');
  }
  
  // 验证邮箱
  // 邮箱必须包含@符号
  if (!user.email || !user.email.includes('@')) {
    // 添加邮箱错误
    errors.push('邮箱格式不正确');
  }
  
  // 验证年龄
  // 年龄必须在0-150之间
  if (user.age < 0 || user.age > 150) {
    // 添加年龄错误
    errors.push('年龄必须在0-150之间');
  }
  
  // 检查是否有错误
  if (errors.length > 0) {
    // 如果有错误，返回错误信息
    return { isValid: false, errors: errors };
  } else {
    // 如果没有错误，返回验证通过
    return { isValid: true, errors: [] };
  }
}

// 日期格式化函数（包含注释代码）
function formatDate(date, format) {
  // 获取日期组成部分
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 月份从0开始，需要加1
  const day = date.getDate();
  
  // 格式化月份和日期为两位数
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  
  // 根据格式参数返回不同格式
  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${monthStr}-${dayStr}`;
    case 'DD/MM/YYYY':
      return `${dayStr}/${monthStr}/${year}`;
    case 'MM-DD-YYYY':
      return `${monthStr}-${dayStr}-${year}`;
    // case 'YYYY年MM月DD日':
    //   return `${year}年${month}月${day}日`; // 这个格式暂时不用
    default:
      return `${year}-${monthStr}-${dayStr}`;
  }
}

// 密码强度验证函数（复杂逻辑需要注释）
function validatePassword(password) {
  // 密码不能为空
  if (!password) {
    return { isValid: false, score: 0, feedback: ['密码不能为空'] };
  }
  
  let score = 0;
  const feedback = [];
  
  // 检查长度：至少8个字符
  if (password.length >= 8) {
    score += 25; // 长度得分
  } else {
    feedback.push('密码长度至少8个字符');
  }
  
  // 检查是否包含数字：使用正则表达式
  if (/\d/.test(password)) {
    score += 25; // 数字得分
  } else {
    feedback.push('密码必须包含数字');
  }
  
  // 检查是否包含小写字母
  if (/[a-z]/.test(password)) {
    score += 25; // 小写字母得分
  } else {
    feedback.push('密码必须包含小写字母');
  }
  
  // 检查是否包含大写字母
  if (/[A-Z]/.test(password)) {
    score += 25; // 大写字母得分
  } else {
    feedback.push('密码必须包含大写字母');
  }
  
  // 检查是否包含特殊字符（可选）
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 10; // 特殊字符加分
  }
  
  // 根据得分判断密码强度
  let strength;
  if (score >= 90) {
    strength = '非常强';
  } else if (score >= 70) {
    strength = '强';
  } else if (score >= 50) {
    strength = '中等';
  } else {
    strength = '弱';
  }
  
  return {
    isValid: score >= 70, // 70分以上为有效密码
    score: score,
    strength: strength,
    feedback: feedback
  };
}

// 购物车处理函数（过时注释）
function processShoppingCart(cart) {
  // 这个函数处理购物车结算
  // 注意：这个函数在2023年进行了重构，添加了新的折扣逻辑
  
  // 计算商品总价（旧逻辑）
  // let total = 0;
  // for (const item of cart.items) {
  //   total += item.price * item.quantity;
  // }
  
  // 新逻辑：考虑会员折扣
  let total = calculateSubtotal(cart.items);
  
  // 应用会员折扣（如果是会员）
  if (cart.user && cart.user.isMember) {
    // 会员享受95折
    total = total * 0.95;
  }
  
  // 添加运费（旧逻辑）
  // if (total < 100) {
  //   total += 10; // 运费10元
  // }
  
  // 新逻辑：满100免运费
  if (total < 100) {
    total += 10;
  }
  
  return total;
  
  // 辅助函数（旧实现）
  // function calculateSubtotal(items) {
  //   let subtotal = 0;
  //   for (const item of items) {
  //     subtotal += item.price;
  //   }
  //   return subtotal;
  // }
  
  // 新实现：考虑数量
  function calculateSubtotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}

// 使用示例
const order = {
  items: [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 }
  ]
};

const user = {
  username: 'john',
  email: 'john@example.com',
  age: 25
};

console.log('订单总金额:', calculateOrderTotal(order));
console.log('用户验证:', validateUser(user));
console.log('密码验证:', validatePassword('Password123!'));
console.log('日期格式化:', formatDate(new Date(), 'YYYY-MM-DD'));

// 问题：代码被注释淹没，难以阅读和理解
```

### 重构后代码

```javascript
// 重构后的代码 - 自解释的代码，减少注释

// 1. 使用有意义的函数名和变量名替代注释

function calculateOrderTotal(order) {
  if (isInvalidOrder(order)) {
    return 0;
  }
  
  const subtotal = calculateItemsSubtotal(order.items);
  const discountedAmount = applyVolumeDiscount(subtotal);
  const finalAmount = applyTax(discountedAmount);
  
  return finalAmount;
}

function isInvalidOrder(order) {
  return !order || !order.items || order.items.length === 0;
}

function calculateItemsSubtotal(items) {
  return items.reduce((sum, item) => {
    if (isValidItem(item)) {
      return sum + (item.price * item.quantity);
    }
    return sum;
  }, 0);
}

function isValidItem(item) {
  return item && item.price && item.quantity;
}

function applyVolumeDiscount(amount) {
  const DISCOUNT_THRESHOLD = 1000;
  const DISCOUNT_RATE = 0.1;
  
  if (amount > DISCOUNT_THRESHOLD) {
    return amount * (1 - DISCOUNT_RATE);
  }
  return amount;
}

function applyTax(amount) {
  const TAX_RATE = 0.08;
  return amount * (1 + TAX_RATE);
}

// 2. 用户验证 - 使用清晰的验证规则

function validateUser(user) {
  if (!user) {
    return createValidationResult(false, ['用户不能为空']);
  }
  
  const validationRules = [
    { 
      condition: () => !user.username || user.username.trim().length < 2,
      message: '用户名至少需要2个字符'
    },
    { 
      condition: () => !user.email || !isValidEmail(user.email),
      message: '邮箱格式不正确'
    },
    { 
      condition: () => user.age < 0 || user.age > 150,
      message: '年龄必须在0-150之间'
    }
  ];
  
  const errors = validationRules
    .filter(rule => rule.condition())
    .map(rule => rule.message);
    
  return createValidationResult(errors.length === 0, errors);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function createValidationResult(isValid, errors) {
  return { isValid, errors };
}

// 3. 日期格式化 - 使用配置对象替代注释

class DateFormatter {
  static FORMATS = {
    ISO: 'YYYY-MM-DD',
    EUROPEAN: 'DD/MM/YYYY',
    AMERICAN: 'MM-DD-YYYY',
    CHINESE: 'YYYY年MM月DD日'
  };
  
  static format(date, format) {
    const formatters = {
      [this.FORMATS.ISO]: this.formatIso,
      [this.FORMATS.EUROPEAN]: this.formatEuropean,
      [this.FORMATS.AMERICAN]: this.formatAmerican,
      [this.FORMATS.CHINESE]: this.formatChinese
    };
    
    const formatter = formatters[format] || this.formatIso;
    return formatter.call(this, date);
  }
  
  static formatIso(date) {
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    return `${year}-${month}-${day}`;
  }
  
  static formatEuropean(date) {
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    return `${day}/${month}/${year}`;
  }
  
  static formatAmerican(date) {
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    return `${month}-${day}-${year}`;
  }
  
  static formatChinese(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  }
  
  static padZero(number) {
    return number.toString().padStart(2, '0');
  }
}

// 4. 密码强度验证 - 使用配置和清晰的规则

class PasswordValidator {
  static VALIDATION_RULES = [
    {
      name: 'length',
      pattern: /^.{8,}$/,
      weight: 25,
      message: '密码长度至少8个字符'
    },
    {
      name: 'digit',
      pattern: /\d/,
      weight: 25,
      message: '密码必须包含数字'
    },
    {
      name: 'lowercase',
      pattern: /[a-z]/,
      weight: 25,
      message: '密码必须包含小写字母'
    },
    {
      name: 'uppercase',
      pattern: /[A-Z]/,
      weight: 25,
      message: '密码必须包含大写字母'
    },
    {
      name: 'special',
      pattern: /[!@#$%^&*(),.?":{}|<>]/,
      weight: 10,
      message: '密码包含特殊字符可提高安全性',
      optional: true
    }
  ];
  
  static STRENGTH_LEVELS = [
    { threshold: 90, label: '非常强' },
    { threshold: 70, label: '强' },
    { threshold: 50, label: '中等' },
    { threshold: 0, label: '弱' }
  ];
  
  static validate(password) {
    if (!password) {
      return this.createResult(false, 0, '弱', ['密码不能为空']);
    }
    
    const validation = this.evaluatePassword(password);
    const strength = this.determineStrength(validation.score);
    
    return this.createResult(
      validation.score >= 70,
      validation.score,
      strength,
      validation.messages
    );
  }
  
  static evaluatePassword(password) {
    let score = 0;
    const messages = [];
    
    this.VALIDATION_RULES.forEach(rule => {
      const isMatch = rule.pattern.test(password);
      
      if (isMatch) {
        score += rule.weight;
      } else if (!rule.optional) {
        messages.push(rule.message);
      }
    });
    
    return { score, messages };
  }
  
  static determineStrength(score) {
    const level = this.STRENGTH_LEVELS.find(level => score >= level.threshold);
    return level ? level.label : '弱';
  }
  
  static createResult(isValid, score, strength, messages) {
    return {
      isValid,
      score,
      strength,
      feedback: messages
    };
  }
}

// 5. 购物车处理 - 删除注释代码，使用清晰的业务逻辑

class ShoppingCartProcessor {
  static FREE_SHIPPING_THRESHOLD = 100;
  static MEMBER_DISCOUNT_RATE = 0.05;
  static SHIPPING_COST = 10;
  
  static process(cart) {
    const subtotal = this.calculateSubtotal(cart.items);
    const discountedAmount = this.applyMemberDiscount(subtotal, cart.user);
    const finalAmount = this.applyShipping(discountedAmount, subtotal);
    
    return finalAmount;
  }
  
  static calculateSubtotal(items) {
    return items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
  }
  
  static applyMemberDiscount(amount, user) {
    if (user && user.isMember) {
      return amount * (1 - this.MEMBER_DISCOUNT_RATE);
    }
    return amount;
  }
  
  static applyShipping(amount, subtotal) {
    if (subtotal < this.FREE_SHIPPING_THRESHOLD) {
      return amount + this.SHIPPING_COST;
    }
    return amount;
  }
}

// 6. 使用断言表达代码假设

class TemperatureConverter {
  static ABSOLUTE_ZERO_CELSIUS = -273.15;
  
  static celsiusToFahrenheit(celsius) {
    // 确保温度不低于绝对零度
    if (celsius < this.ABSOLUTE_ZERO_CELSIUS) {
      throw new Error(`温度不能低于绝对零度 ${this.ABSOLUTE_ZERO_CELSIUS}°C`);
    }
    
    return (celsius * 9/5) + 32;
  }
  
  static fahrenheitToCelsius(fahrenheit) {
    const celsius = (fahrenheit - 32) * 5/9;
    
    // 断言转换后的温度合理
    if (celsius < this.ABSOLUTE_ZERO_CELSIUS) {
      throw new Error(`转换后的温度异常: ${celsius}°C`);
    }
    
    return celsius;
  }
}

// 使用示例
const order = {
  items: [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 }
  ]
};

const user = {
  username: 'john',
  email: 'john@example.com',
  age: 25
};

console.log('订单总金额:', calculateOrderTotal(order));
console.log('用户验证:', validateUser(user));
console.log('密码验证:', PasswordValidator.validate('Password123!'));
console.log('日期格式化:', DateFormatter.format(new Date(), DateFormatter.FORMATS.ISO));
console.log('购物车处理:', ShoppingCartProcessor.process({
  items: [{ price: 80, quantity: 1 }],
  user: { isMember: true }
}));

// 重构后的代码更加清晰，注释大大减少
```

## 课后练习

1. **识别注释坏味道**：找出项目中过多的注释
2. **提取方法**：将复杂逻辑提取为有意义的函数
3. **重命名变量**：使用更具描述性的变量名
4. **删除注释代码**：清理不再需要的注释

**练习代码**：
```javascript
// 重构以下代码，减少注释
function processData(data) {
  // 检查数据是否为空
  if (!data) {
    // 如果为空，返回空数组
    return [];
  }
  
  // 初始化结果数组
  let result = [];
  
  // 遍历数据中的每个元素
  for (let i = 0; i < data.length; i++) {
    // 获取当前元素
    const item = data[i];
    
    // 检查元素是否有效
    if (item && item.value) {
      // 处理元素值：乘以2
      const processedValue = item.value * 2;
      
      // 将处理后的值添加到结果中
      result.push(processedValue);
    }
  }
  
  // 返回最终结果
  return result;
}