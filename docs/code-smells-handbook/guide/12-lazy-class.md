# 12. 冗赘类 (Lazy Class)

冗赘类是指没有足够职责的类。

## 问题定义

当一个类的职责太少，或者其功能可以被其他类轻松吸收时，就出现了冗赘类的坏味道。这样的类增加了代码的复杂性，却没有提供相应的价值。

## 典型症状

1. **方法稀少**：类中只有很少的方法
2. **字段简单**：类中的字段很少或很简单
3. **依赖复杂**：类的依赖关系比其功能更复杂
4. **使用频率低**：类很少被使用
5. **功能重叠**：类的功能可以被其他类轻松实现

## 重构方法

### 1. 内联类 (Inline Class)
将类的功能合并到其他类中。

### 2. 折叠继承体系 (Collapse Hierarchy)
合并继承层次中的类。

### 3. 用委托替代继承 (Replace Inheritance with Delegation)
用委托关系替代继承关系。

### 4. 用策略模式替代子类 (Replace Subclass with Strategy)
用策略模式替代子类。

### 5. 移除中间人 (Remove Middle Man)
移除没有实际价值的中间类。

## 实际案例

### 重构前代码

```javascript
// 冗赘类的典型例子

// 1. 过于简单的值对象类
class UserName {
  constructor(name) {
    this.value = name;
  }
  
  toString() {
    return this.value;
  }
  
  // 只有这一个简单的方法
  isValid() {
    return this.value && this.value.length >= 2;
  }
}

class UserEmail {
  constructor(email) {
    this.value = email;
  }
  
  toString() {
    return this.value;
  }
  
  // 简单的验证逻辑
  isValid() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.value);
  }
}

class UserPhone {
  constructor(phone) {
    this.value = phone;
  }
  
  toString() {
    return this.value;
  }
  
  // 简单的验证逻辑
  isValid() {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(this.value);
  }
}

// 2. 过于简单的服务类
class UserNameValidator {
  static validate(name) {
    return name && name.length >= 2;
  }
}

class UserEmailValidator {
  static validate(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

class UserPhoneValidator {
  static validate(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }
}

// 3. 过于简单的数据持有类
class UserContactInfo {
  constructor(email, phone) {
    this.email = new UserEmail(email);
    this.phone = new UserPhone(phone);
  }
  
  // 只有getter方法
  getEmail() {
    return this.email.toString();
  }
  
  getPhone() {
    return this.phone.toString();
  }
  
  // 简单的验证方法
  isValid() {
    return this.email.isValid() && this.phone.isValid();
  }
}

// 4. 过于简单的包装类
class UserServiceWrapper {
  constructor(userService) {
    this.userService = userService;
  }
  
  // 只是简单转发调用
  getUser(id) {
    return this.userService.getUser(id);
  }
  
  createUser(userData) {
    return this.userService.createUser(userData);
  }
  
  updateUser(id, userData) {
    return this.userService.updateUser(id, userData);
  }
  
  deleteUser(id) {
    return this.userService.deleteUser(id);
  }
}

// 5. 过于简单的配置类
class AppConfig {
  constructor() {
    this.apiUrl = 'https://api.example.com';
    this.timeout = 5000;
    this.retryCount = 3;
  }
  
  // 只有getter方法
  getApiUrl() {
    return this.apiUrl;
  }
  
  getTimeout() {
    return this.timeout;
  }
  
  getRetryCount() {
    return this.retryCount;
  }
}

// 使用示例 - 过多的类增加了复杂性
const userName = new UserName('张三');
const userEmail = new UserEmail('zhangsan@example.com');
const userPhone = new UserPhone('13800138000');

if (userName.isValid() && userEmail.isValid() && userPhone.isValid()) {
  const contactInfo = new UserContactInfo(userEmail, userPhone);
  
  if (contactInfo.isValid()) {
    const config = new AppConfig();
    const userService = new UserServiceWrapper(realUserService);
    
    userService.createUser({
      name: userName.toString(),
      email: contactInfo.getEmail(),
      phone: contactInfo.getPhone()
    });
  }
}

// 验证逻辑分散在多个类中
if (UserNameValidator.validate('李四') && 
    UserEmailValidator.validate('lisi@example.com') &&
    UserPhoneValidator.validate('13900139000')) {
  console.log('验证通过');
}
```

### 重构后代码

```javascript
// 重构后的代码 - 消除冗赘类

// 1. 合并简单的值对象类
class User {
  constructor(name, email, phone) {
    this.name = this.validateName(name);
    this.email = this.validateEmail(email);
    this.phone = this.validatePhone(phone);
  }
  
  // 将验证逻辑内联到User类中
  validateName(name) {
    if (!name || name.length < 2) {
      throw new Error('用户名至少2个字符');
    }
    return name;
  }
  
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('邮箱格式不正确');
    }
    return email;
  }
  
  validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('手机号码格式不正确');
    }
    return phone;
  }
  
  // 添加有用的业务方法
  getContactInfo() {
    return {
      name: this.name,
      email: this.email,
      phone: this.phone
    };
  }
  
  getDisplayName() {
    return this.name;
  }
  
  canReceiveNotifications() {
    return this.email && this.phone;
  }
}

// 2. 合并验证器类
class Validator {
  static validateName(name) {
    return name && name.length >= 2;
  }
  
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }
  
  // 添加组合验证方法
  static validateUserData(userData) {
    return this.validateName(userData.name) &&
           this.validateEmail(userData.email) &&
           this.validatePhone(userData.phone);
  }
}

// 3. 简化配置管理
const AppConfig = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retryCount: 3,
  
  // 直接作为对象属性访问，不需要getter方法
  getSettings() {
    return {
      apiUrl: this.apiUrl,
      timeout: this.timeout,
      retryCount: this.retryCount
    };
  },
  
  // 添加有用的配置方法
  getApiEndpoint(path) {
    return `${this.apiUrl}${path}`;
  },
  
  getTimeoutWithRetry() {
    return this.timeout * this.retryCount;
  }
};

// 4. 简化服务类 - 移除不必要的包装
class UserService {
  constructor(config = AppConfig) {
    this.config = config;
  }
  
  async getUser(id) {
    const response = await fetch(this.config.getApiEndpoint(`/users/${id}`), {
      timeout: this.config.timeout
    });
    return response.json();
  }
  
  async createUser(userData) {
    // 使用统一的验证器
    if (!Validator.validateUserData(userData)) {
      throw new Error('用户数据验证失败');
    }
    
    const response = await fetch(this.config.getApiEndpoint('/users'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      timeout: this.config.timeout
    });
    
    return response.json();
  }
  
  async updateUser(id, userData) {
    if (!Validator.validateUserData(userData)) {
      throw new Error('用户数据验证失败');
    }
    
    const response = await fetch(this.config.getApiEndpoint(`/users/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      timeout: this.config.timeout
    });
    
    return response.json();
  }
  
  async deleteUser(id) {
    const response = await fetch(this.config.getApiEndpoint(`/users/${id}`), {
      method: 'DELETE',
      timeout: this.config.timeout
    });
    
    return response.json();
  }
  
  // 添加有用的业务方法
  async searchUsers(criteria) {
    const params = new URLSearchParams(criteria);
    const response = await fetch(this.config.getApiEndpoint(`/users?${params}`), {
      timeout: this.config.timeout
    });
    
    return response.json();
  }
  
  async getUserStats() {
    const response = await fetch(this.config.getApiEndpoint('/users/stats'), {
      timeout: this.config.timeout
    });
    
    return response.json();
  }
}

// 5. 简化数据转换类
class UserDTO {
  static fromApiResponse(apiData) {
    return {
      id: apiData.id,
      name: apiData.name,
      email: apiData.email,
      phone: apiData.phone,
      createdAt: new Date(apiData.created_at),
      updatedAt: new Date(apiData.updated_at)
    };
  }
  
  static toApiRequest(userData) {
    return {
      name: userData.name,
      email: userData.email,
      phone: userData.phone
    };
  }
}

// 使用示例 - 代码变得简洁明了
try {
  // 创建用户 - 只需要一个类
  const user = new User('张三', 'zhangsan@example.com', '13800138000');
  
  // 使用服务 - 直接调用，不需要包装
  const userService = new UserService();
  const createdUser = await userService.createUser(user.getContactInfo());
  
  console.log('用户创建成功:', createdUser);
  
  // 配置访问 - 直接使用对象
  console.log('API端点:', AppConfig.getApiEndpoint('/users'));
  console.log('总超时时间:', AppConfig.getTimeoutWithRetry());
  
} catch (error) {
  console.error('操作失败:', error.message);
}

// 验证示例 - 使用统一的验证器
if (Validator.validateUserData({
  name: '李四',
  email: 'lisi@example.com',
  phone: '13900139000'
})) {
  console.log('用户数据验证通过');
}
```

## 课后练习

1. **冗赘类识别**：找出你项目中职责过少的类
2. **内联重构**：将简单类的功能合并到其他类中
3. **功能整合**：将相关的功能整合到同一个类中
4. **接口简化**：设计简洁的接口来减少类的数量

**练习代码**：
```javascript
// 重构以下代码，消除冗赘类
class Price {
  constructor(amount) {
    this.amount = amount;
  }
  
  getValue() {
    return this.amount;
  }
}

class Currency {
  constructor(code) {
    this.code = code;
  }
  
  getCode() {
    return this.code;
  }
}

class PriceValidator {
  static validate(price) {
    return price > 0;
  }
}

class CurrencyValidator {
  static validate(currency) {
    return ['CNY', 'USD', 'EUR'].includes(currency);
  }
}

class MoneyService {
  constructor(priceService, currencyService) {
    this.priceService = priceService;
    this.currencyService = currencyService;
  }
  
  formatMoney(price, currency) {
    return `${currency.getCode()}${price.getValue()}`;
  }
}