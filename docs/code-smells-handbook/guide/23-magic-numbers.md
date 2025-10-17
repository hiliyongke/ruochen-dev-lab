# 23. 魔法数字 (Magic Numbers)

魔法数字是指在代码中直接出现的没有明确含义的数字，这些数字应该被命名常量替代。

## 问题定义

魔法数字是指在代码中直接出现的数字字面量，这些数字没有明确的含义，使得代码难以理解和维护。

## 典型症状

1. **直接数字**：代码中出现没有解释的数字
2. **重复数字**：相同的数字在多个地方出现
3. **计算数字**：用于计算的硬编码数字
4. **配置数字**：配置参数中的数字
5. **阈值数字**：用于比较的阈值数字

## 重构方法

### 1. 提取常量 (Extract Constant)
将魔法数字提取为有意义的常量。

### 2. 使用枚举 (Use Enum)
将相关的数字定义为枚举类型。

### 3. 配置化 (Configuration)
将数字移到配置文件中。

### 4. 计算方法 (Calculation Method)
将复杂计算提取为方法。

### 5. 使用常量类 (Constants Class)
创建专门的常量类。

## 实际案例

### 重构前代码

```javascript
// 魔法数字典型例子

// 订单处理函数
function processOrder(order) {
  // 检查订单金额是否达到免运费阈值
  if (order.amount > 100) {
    order.shippingCost = 0;
  } else {
    order.shippingCost = 10;
  }
  
  // 应用折扣
  if (order.amount > 500) {
    order.discount = order.amount * 0.1; // 10%折扣
  } else if (order.amount > 200) {
    order.discount = order.amount * 0.05; // 5%折扣
  } else {
    order.discount = 0;
  }
  
  // 计算税费（税率8%）
  order.tax = order.amount * 0.08;
  
  // 最终金额 = 原金额 - 折扣 + 运费 + 税费
  order.finalAmount = order.amount - order.discount + order.shippingCost + order.tax;
  
  return order;
}

// 用户等级计算
function calculateUserLevel(points) {
  if (points >= 1000) {
    return '钻石会员';
  } else if (points >= 500) {
    return '黄金会员';
  } else if (points >= 100) {
    return '白银会员';
  } else {
    return '普通会员';
  }
}

// 密码验证
function validatePassword(password) {
  if (password.length < 8) {
    return { isValid: false, message: '密码长度至少8位' };
  }
  
  if (password.length > 20) {
    return { isValid: false, message: '密码长度不能超过20位' };
  }
  
  // 检查是否包含数字（ASCII 48-57）
  let hasDigit = false;
  for (let i = 0; i < password.length; i++) {
    const charCode = password.charCodeAt(i);
    if (charCode >= 48 && charCode <= 57) {
      hasDigit = true;
      break;
    }
  }
  
  if (!hasDigit) {
    return { isValid: false, message: '密码必须包含数字' };
  }
  
  return { isValid: true, message: '密码有效' };
}

// 日期计算
function calculateDueDate(createDate, daysToAdd) {
  const dueDate = new Date(createDate);
  dueDate.setDate(dueDate.getDate() + daysToAdd);
  
  // 检查是否是周末（周六6，周日0）
  const dayOfWeek = dueDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // 如果是周末，顺延到周一
    dueDate.setDate(dueDate.getDate() + (8 - dayOfWeek) % 7);
  }
  
  return dueDate;
}

// 颜色计算
function calculateColorBrightness(hexColor) {
  // 解析十六进制颜色
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  
  // 计算亮度（公式：0.299*R + 0.587*G + 0.114*B）
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // 判断亮度级别
  if (brightness > 180) {
    return '亮色';
  } else if (brightness > 120) {
    return '中等';
  } else {
    return '暗色';
  }
}

// 文件大小格式化
function formatFileSize(bytes) {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1048576) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else if (bytes < 1073741824) {
    return (bytes / 1048576).toFixed(2) + ' MB';
  } else {
    return (bytes / 1073741824).toFixed(2) + ' GB';
  }
}

// 网络请求超时设置
class ApiClient {
  constructor() {
    this.timeout = 5000; // 5秒超时
    this.retryCount = 3; // 重试3次
    this.backoffDelay = 1000; // 1秒延迟
  }
  
  async request(url, options = {}) {
    for (let i = 0; i < this.retryCount; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.status >= 200 && response.status < 300) {
          return await response.json();
        } else if (response.status >= 500) {
          // 服务器错误，重试
          await this.delay(this.backoffDelay * Math.pow(2, i));
          continue;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        if (i === this.retryCount - 1) {
          throw error;
        }
        await this.delay(this.backoffDelay * Math.pow(2, i));
      }
    }
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 使用示例
console.log('订单处理:', processOrder({ amount: 300 }));
console.log('用户等级:', calculateUserLevel(750));
console.log('密码验证:', validatePassword('abc123'));
console.log('到期日期:', calculateDueDate(new Date(), 7));
console.log('颜色亮度:', calculateColorBrightness('#FF0000'));
console.log('文件大小:', formatFileSize(1048576));

const client = new ApiClient();
// client.request('https://api.example.com/data');

// 问题：代码中充满了魔法数字，难以理解和维护
```

### 重构后代码

```javascript
// 重构后的代码 - 使用常量替代魔法数字

// 1. 订单处理 - 使用常量定义业务规则

class OrderProcessor {
  // 常量定义
  static FREE_SHIPPING_THRESHOLD = 100;
  static SHIPPING_COST = 10;
  
  static DISCOUNT_TIERS = [
    { threshold: 500, rate: 0.1 },
    { threshold: 200, rate: 0.05 }
  ];
  
  static TAX_RATE = 0.08;
  
  static process(order) {
    const shippingCost = this.calculateShippingCost(order.amount);
    const discount = this.calculateDiscount(order.amount);
    const tax = this.calculateTax(order.amount);
    
    return {
      ...order,
      shippingCost,
      discount,
      tax,
      finalAmount: order.amount - discount + shippingCost + tax
    };
  }
  
  static calculateShippingCost(amount) {
    return amount > this.FREE_SHIPPING_THRESHOLD ? 0 : this.SHIPPING_COST;
  }
  
  static calculateDiscount(amount) {
    const tier = this.DISCOUNT_TIERS.find(t => amount > t.threshold);
    return tier ? amount * tier.rate : 0;
  }
  
  static calculateTax(amount) {
    return amount * this.TAX_RATE;
  }
}

// 2. 用户等级 - 使用枚举定义等级规则

class UserLevelCalculator {
  static LEVELS = {
    DIAMOND: { threshold: 1000, label: '钻石会员' },
    GOLD: { threshold: 500, label: '黄金会员' },
    SILVER: { threshold: 100, label: '白银会员' },
    REGULAR: { threshold: 0, label: '普通会员' }
  };
  
  static calculate(points) {
    const level = Object.values(this.LEVELS)
      .find(level => points >= level.threshold);
    
    return level ? level.label : this.LEVELS.REGULAR.label;
  }
}

// 3. 密码验证 - 使用常量定义验证规则

class PasswordValidator {
  static MIN_LENGTH = 8;
  static MAX_LENGTH = 20;
  
  static ASCII_DIGIT_START = 48; // '0'
  static ASCII_DIGIT_END = 57;   // '9'
  
  static validate(password) {
    if (password.length < this.MIN_LENGTH) {
      return this.createResult(false, `密码长度至少${this.MIN_LENGTH}位`);
    }
    
    if (password.length > this.MAX_LENGTH) {
      return this.createResult(false, `密码长度不能超过${this.MAX_LENGTH}位`);
    }
    
    if (!this.containsDigit(password)) {
      return this.createResult(false, '密码必须包含数字');
    }
    
    return this.createResult(true, '密码有效');
  }
  
  static containsDigit(password) {
    return Array.from(password).some(char => {
      const charCode = char.charCodeAt(0);
      return charCode >= this.ASCII_DIGIT_START && 
             charCode <= this.ASCII_DIGIT_END;
    });
  }
  
  static createResult(isValid, message) {
    return { isValid, message };
  }
}

// 4. 日期计算 - 使用常量定义工作日规则

class DateCalculator {
  static WEEKEND_DAYS = {
    SATURDAY: 6,
    SUNDAY: 0
  };
  
  static NEXT_MONDAY_OFFSET = 8;
  
  static calculateDueDate(createDate, daysToAdd) {
    let dueDate = new Date(createDate);
    dueDate.setDate(dueDate.getDate() + daysToAdd);
    
    if (this.isWeekend(dueDate)) {
      dueDate = this.adjustToNextWeekday(dueDate);
    }
    
    return dueDate;
  }
  
  static isWeekend(date) {
    const dayOfWeek = date.getDay();
    return dayOfWeek === this.WEEKEND_DAYS.SATURDAY || 
           dayOfWeek === this.WEEKEND_DAYS.SUNDAY;
  }
  
  static adjustToNextWeekday(date) {
    const adjustedDate = new Date(date);
    const dayOfWeek = date.getDay();
    const daysToAdd = (this.NEXT_MONDAY_OFFSET - dayOfWeek) % 7;
    adjustedDate.setDate(adjustedDate.getDate() + daysToAdd);
    return adjustedDate;
  }
}

// 5. 颜色计算 - 使用常量定义颜色公式

class ColorUtils {
  static BRIGHTNESS_WEIGHTS = {
    RED: 299,
    GREEN: 587,
    BLUE: 114
  };
  
  static BRIGHTNESS_SCALE = 1000;
  
  static BRIGHTNESS_LEVELS = {
    BRIGHT: { threshold: 180, label: '亮色' },
    MEDIUM: { threshold: 120, label: '中等' },
    DARK: { threshold: 0, label: '暗色' }
  };
  
  static calculateBrightness(hexColor) {
    const { r, g, b } = this.parseHexColor(hexColor);
    
    const brightness = (
      r * this.BRIGHTNESS_WEIGHTS.RED +
      g * this.BRIGHTNESS_WEIGHTS.GREEN +
      b * this.BRIGHTNESS_WEIGHTS.BLUE
    ) / this.BRIGHTNESS_SCALE;
    
    return this.getBrightnessLevel(brightness);
  }
  
  static parseHexColor(hexColor) {
    return {
      r: parseInt(hexColor.substr(1, 2), 16),
      g: parseInt(hexColor.substr(3, 2), 16),
      b: parseInt(hexColor.substr(5, 2), 16)
    };
  }
  
  static getBrightnessLevel(brightness) {
    const level = Object.values(this.BRIGHTNESS_LEVELS)
      .find(level => brightness >= level.threshold);
    
    return level ? level.label : this.BRIGHTNESS_LEVELS.DARK.label;
  }
}

// 6. 文件大小格式化 - 使用常量定义单位转换

class FileSizeFormatter {
  static BYTE_UNITS = [
    { unit: 'GB', divisor: 1073741824 },
    { unit: 'MB', divisor: 1048576 },
    { unit: 'KB', divisor: 1024 },
    { unit: 'B', divisor: 1 }
  ];
  
  static DECIMAL_PLACES = 2;
  
  static format(bytes) {
    const unit = this.BYTE_UNITS.find(u => bytes >= u.divisor);
    
    if (!unit) {
      return bytes + ' B';
    }
    
    const value = bytes / unit.divisor;
    return value.toFixed(this.DECIMAL_PLACES) + ' ' + unit.unit;
  }
}

// 7. 网络请求 - 使用常量定义超时和重试策略

class ApiClient {
  static TIMEOUT_MS = 5000;
  static MAX_RETRIES = 3;
  static BASE_DELAY_MS = 1000;
  static BACKOFF_MULTIPLIER = 2;
  
  static HTTP_STATUS = {
    SUCCESS_MIN: 200,
    SUCCESS_MAX: 299,
    SERVER_ERROR_MIN: 500
  };
  
  constructor() {
    this.timeout = this.constructor.TIMEOUT_MS;
    this.retryCount = this.constructor.MAX_RETRIES;
    this.baseDelay = this.constructor.BASE_DELAY_MS;
  }
  
  async request(url, options = {}) {
    for (let attempt = 0; attempt < this.retryCount; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, options);
        
        if (this.isSuccessResponse(response)) {
          return await response.json();
        } else if (this.isServerError(response)) {
          await this.delay(this.calculateBackoffDelay(attempt));
          continue;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        if (attempt === this.retryCount - 1) {
          throw error;
        }
        await this.delay(this.calculateBackoffDelay(attempt));
      }
    }
  }
  
  async fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  isSuccessResponse(response) {
    return response.status >= this.constructor.HTTP_STATUS.SUCCESS_MIN && 
           response.status <= this.constructor.HTTP_STATUS.SUCCESS_MAX;
  }
  
  isServerError(response) {
    return response.status >= this.constructor.HTTP_STATUS.SERVER_ERROR_MIN;
  }
  
  calculateBackoffDelay(attempt) {
    return this.baseDelay * Math.pow(this.constructor.BACKOFF_MULTIPLIER, attempt);
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 8. 配置化的常量管理

class AppConstants {
  // 业务配置
  static BUSINESS = {
    FREE_SHIPPING_THRESHOLD: 100,
    SHIPPING_COST: 10,
    TAX_RATE: 0.08,
    DISCOUNT_TIERS: [
      { threshold: 500, rate: 0.1 },
      { threshold: 200, rate: 0.05 }
    ]
  };
  
  // 安全配置
  static SECURITY = {
    PASSWORD: {
      MIN_LENGTH: 8,
      MAX_LENGTH: 20,
      REQUIRE_DIGIT: true,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true
    },
    SESSION: {
      TIMEOUT_MINUTES: 30,
      MAX_SESSIONS: 5
    }
  };
  
  // 网络配置
  static NETWORK = {
    TIMEOUT_MS: 5000,
    MAX_RETRIES: 3,
    BASE_DELAY_MS: 1000,
    BACKOFF_MULTIPLIER: 2
  };
  
  // 日期配置
  static DATE = {
    WEEKEND_DAYS: [0, 6], // 周日和周六
    WORKING_HOURS: {
      START: 9,
      END: 18
    }
  };
  
  // 文件配置
  static FILE = {
    MAX_SIZE_BYTES: 10485760, // 10MB
    ALLOWED_EXTENSIONS: ['.jpg', '.png', '.pdf', '.doc'],
    CHUNK_SIZE: 8192
  };
}

// 9. 使用配置常量的业务逻辑

class ConfigurableOrderProcessor {
  static process(order, config = AppConstants.BUSINESS) {
    const shippingCost = order.amount > config.FREE_SHIPPING_THRESHOLD 
      ? 0 
      : config.SHIPPING_COST;
    
    const discount = this.calculateDiscount(order.amount, config.DISCOUNT_TIERS);
    const tax = order.amount * config.TAX_RATE;
    
    return {
      ...order,
      shippingCost,
      discount,
      tax,
      finalAmount: order.amount - discount + shippingCost + tax
    };
  }
  
  static calculateDiscount(amount, discountTiers) {
    const tier = discountTiers.find(t => amount > t.threshold);
    return tier ? amount * tier.rate : 0;
  }
}

// 10. 环境特定的配置

class EnvironmentConfig {
  static DEVELOPMENT = {
    API_BASE_URL: 'http://localhost:3000/api',
    LOG_LEVEL: 'debug',
    CACHE_ENABLED: false,
    FEATURES: {
      NEW_UI: true,
      ANALYTICS: false
    }
  };
  
  static PRODUCTION = {
    API_BASE_URL: 'https://api.example.com',
    LOG_LEVEL: 'error',
    CACHE_ENABLED: true,
    FEATURES: {
      NEW_UI: false,
      ANALYTICS: true
    }
  };
  
  static TESTING = {
    API_BASE_URL: 'https://test-api.example.com',
    LOG_LEVEL: 'info',
    CACHE_ENABLED: false,
    FEATURES: {
      NEW_UI: true,
      ANALYTICS: false
    }
  };
  
  static getConfig(env = process.env.NODE_ENV) {
    switch (env) {
      case 'development':
        return this.DEVELOPMENT;
      case 'production':
        return this.PRODUCTION;
      case 'test':
        return this.TESTING;
      default:
        return this.DEVELOPMENT;
    }
  }
}

// 使用示例
console.log('订单处理:', OrderProcessor.process({ amount: 300 }));
console.log('用户等级:', UserLevelCalculator.calculate(750));
console.log('密码验证:', PasswordValidator.validate('Password123'));
console.log('到期日期:', DateCalculator.calculateDueDate(new Date(), 7));
console.log('颜色亮度:', ColorUtils.calculateBrightness('#FF0000'));
console.log('文件大小:', FileSizeFormatter.format(1048576));

console.log('配置化订单处理:', ConfigurableOrderProcessor.process({ amount: 300 }));
console.log('开发环境配置:', EnvironmentConfig.getConfig('development'));

// 重构后的代码优势：
// 1. 所有数字都有明确的含义
// 2. 易于修改和维护
// 3. 配置集中管理
// 4. 支持不同环境配置
```

## 课后练习

1. **识别魔法数字**：找出项目中的魔法数字
2. **提取常量**：将魔法数字提取为常量
3. **创建配置类**：组织相关的常量
4. **环境配置**：实现不同环境的配置

**练习代码**：
```javascript
// 重构以下代码，消除魔法数字
function calculateScore(answers) {
  let score = 0;
  
  for (let i = 0; i < answers.length; i++) {
    if (answers[i].correct) {
      if (answers[i].difficulty === 'easy') {
        score += 1;
      } else if (answers[i].difficulty === 'medium') {
        score += 2;
      } else if (answers[i].difficulty === 'hard') {
        score += 3;
      }
    }
  }
  
  if (score >= 90) {
    return '优秀';
  } else if (score >= 70) {
    return '良好';
  } else if (score >= 60) {
    return '及格';
  } else {
    return '不及格';
  }
}

// 重构提示：
// 1. 定义难度分数常量
// 2. 定义等级阈值常量
// 3. 使用配置对象管理分数规则
```

**进阶练习**：
```javascript
// 创建一个完整的配置管理系统
class AppConfig {
  // 实现以下功能：
  // 1. 支持不同环境配置
  // 2. 支持配置热更新
  // 3. 支持配置验证
  // 4. 支持默认值设置
}

// 使用你的配置系统重构上面的练习代码
```

通过消除魔法数字，代码变得更加清晰、可维护，并且更容易适应业务规则的变化。