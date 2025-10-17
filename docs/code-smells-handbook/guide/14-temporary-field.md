# 14. 临时字段 (Temporary Field)

临时字段是指只在特定情况下使用的字段。

## 问题定义

当一个对象的某些字段只在某些特定情况下被使用，而在其他情况下保持为空或未使用状态时，就出现了临时字段的坏味道。这导致对象的状态不一致，增加了理解的难度。

## 典型症状

1. **字段闲置**：某些字段在大部分时间内不被使用
2. **条件设置**：字段只在特定条件下被设置值
3. **状态依赖**：字段的有效性依赖于其他字段或条件
4. **初始化复杂**：对象初始化时需要处理多种情况
5. **理解困难**：难以理解字段的用途和生命周期

## 重构方法

### 1. 提取类 (Extract Class)
将临时字段和相关方法提取到新的类中。

### 2. 引入空对象 (Introduce Null Object)
用空对象模式来处理可选字段。

### 3. 用策略模式替代条件表达式 (Replace Conditional with Strategy)
用策略模式来处理不同的情况。

### 4. 用状态模式替代条件表达式 (Replace Conditional with State)
用状态模式来处理对象的不同状态。

### 5. 移除设置方法 (Remove Setting Method)
移除不必要的字段设置方法。

## 实际案例

### 重构前代码

```javascript
// 临时字段的典型例子

class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.isActive = true;
    
    // 临时字段 - 只在特定情况下使用
    this.lastLoginTime = null;      // 只在登录时设置
    this.loginAttempts = 0;         // 只在登录失败时使用
    this.lockUntil = null;          // 只在账户锁定时使用
    this.passwordResetToken = null; // 只在重置密码时使用
    this.passwordResetExpires = null; // 只在重置密码时使用
    this.temporaryPassword = null;   // 只在临时密码场景使用
    this.emailVerificationToken = null; // 只在验证邮箱时使用
    this.preferences = {};          // 只在用户设置时使用
  }
  
  // 登录相关方法 - 使用临时字段
  login(password) {
    if (this.isLocked()) {
      throw new Error('账户已被锁定，请稍后再试');
    }
    
    if (this.validatePassword(password)) {
      this.lastLoginTime = new Date();
      this.loginAttempts = 0; // 重置尝试次数
      this.lockUntil = null;  // 清除锁定
      return true;
    } else {
      this.loginAttempts++;
      if (this.loginAttempts >= 5) {
        this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 锁定30分钟
      }
      return false;
    }
  }
  
  isLocked() {
    return this.lockUntil && this.lockUntil > new Date();
  }
  
  validatePassword(password) {
    // 简化密码验证
    return password === 'correct_password';
  }
  
  // 密码重置相关方法 - 使用其他临时字段
  requestPasswordReset() {
    this.passwordResetToken = this.generateToken();
    this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1小时有效
    return this.passwordResetToken;
  }
  
  resetPassword(token, newPassword) {
    if (this.passwordResetToken !== token) {
      throw new Error('无效的重置令牌');
    }
    
    if (this.passwordResetExpires < new Date()) {
      throw new Error('重置令牌已过期');
    }
    
    // 重置密码逻辑
    this.password = newPassword;
    this.passwordResetToken = null;
    this.passwordResetExpires = null;
    this.loginAttempts = 0;
  }
  
  // 邮箱验证相关方法 - 使用其他临时字段
  requestEmailVerification() {
    this.emailVerificationToken = this.generateToken();
    return this.emailVerificationToken;
  }
  
  verifyEmail(token) {
    if (this.emailVerificationToken === token) {
      this.isEmailVerified = true;
      this.emailVerificationToken = null;
      return true;
    }
    return false;
  }
  
  // 用户偏好设置 - 使用preferences字段
  setPreference(key, value) {
    this.preferences[key] = value;
  }
  
  getPreference(key) {
    return this.preferences[key];
  }
  
  // 工具方法
  generateToken() {
    return Math.random().toString(36).substring(2);
  }
  
  // 其他用户相关方法
  getProfile() {
    return {
      name: this.name,
      email: this.email,
      isActive: this.isActive,
      lastLogin: this.lastLoginTime,
      // 很多临时字段在普通场景下不需要
    };
  }
}

// 使用示例 - 临时字段导致对象状态复杂
const user = new User('张三', 'zhangsan@example.com');

// 正常使用场景 - 大部分字段为空
console.log(user.getProfile());

// 登录场景 - 设置临时字段
user.login('wrong_password');
user.login('wrong_password');
user.login('wrong_password');
user.login('wrong_password');
user.login('wrong_password'); // 第5次失败，账户被锁定

try {
  user.login('correct_password'); // 会抛出锁定错误
} catch (error) {
  console.error(error.message);
}

// 重置密码场景 - 使用其他临时字段
const resetToken = user.requestPasswordReset();
// 此时passwordResetToken和passwordResetExpires被设置

// 验证邮箱场景 - 使用其他临时字段
const verifyToken = user.requestEmailVerification();
// 此时emailVerificationToken被设置

// 偏好设置场景 - 使用preferences字段
user.setPreference('theme', 'dark');
user.setPreference('language', 'zh-CN');

// 问题：用户对象在不同场景下有不同的"有效字段集合"
```

### 重构后代码

```javascript
// 重构后的代码 - 提取专门的类来处理不同场景

// 用户核心信息类
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.isActive = true;
    this.isEmailVerified = false;
    this.createdAt = new Date();
  }
  
  // 只包含核心业务逻辑
  getProfile() {
    return {
      name: this.name,
      email: this.email,
      isActive: this.isActive,
      isEmailVerified: this.isEmailVerified,
      createdAt: this.createdAt
    };
  }
  
  // 简单的验证方法
  validate() {
    return this.name && this.email && this.name.length >= 2;
  }
}

// 登录安全管理类 - 处理登录相关的临时字段
class LoginSecurity {
  constructor(user) {
    this.user = user;
    this.loginAttempts = 0;
    this.lockUntil = null;
    this.lastLoginTime = null;
  }
  
  login(password) {
    if (this.isLocked()) {
      throw new Error('账户已被锁定，请稍后再试');
    }
    
    if (this.validatePassword(password)) {
      this.lastLoginTime = new Date();
      this.loginAttempts = 0;
      this.lockUntil = null;
      return true;
    } else {
      this.loginAttempts++;
      if (this.loginAttempts >= 5) {
        this.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      return false;
    }
  }
  
  isLocked() {
    return this.lockUntil && this.lockUntil > new Date();
  }
  
  getRemainingLockTime() {
    if (!this.isLocked()) return 0;
    return Math.max(0, this.lockUntil - new Date());
  }
  
  validatePassword(password) {
    // 简化密码验证
    return password === 'correct_password';
  }
  
  getSecurityInfo() {
    return {
      loginAttempts: this.loginAttempts,
      isLocked: this.isLocked(),
      lastLoginTime: this.lastLoginTime,
      remainingLockTime: this.getRemainingLockTime()
    };
  }
}

// 密码重置管理类 - 处理密码重置相关的临时字段
class PasswordResetManager {
  constructor(user) {
    this.user = user;
    this.resetToken = null;
    this.resetExpires = null;
  }
  
  requestReset() {
    this.resetToken = this.generateToken();
    this.resetExpires = new Date(Date.now() + 60 * 60 * 1000);
    return this.resetToken;
  }
  
  resetPassword(token, newPassword) {
    if (!this.isValidToken(token)) {
      throw new Error('无效的重置令牌');
    }
    
    // 实际密码重置逻辑
    this.user.password = newPassword;
    this.clearResetData();
    
    return true;
  }
  
  isValidToken(token) {
    return this.resetToken === token && 
           this.resetExpires > new Date();
  }
  
  clearResetData() {
    this.resetToken = null;
    this.resetExpires = null;
  }
  
  generateToken() {
    return Math.random().toString(36).substring(2);
  }
}

// 邮箱验证管理类 - 处理邮箱验证相关的临时字段
class EmailVerificationManager {
  constructor(user) {
    this.user = user;
    this.verificationToken = null;
  }
  
  requestVerification() {
    this.verificationToken = this.generateToken();
    return this.verificationToken;
  }
  
  verifyEmail(token) {
    if (this.verificationToken === token) {
      this.user.isEmailVerified = true;
      this.verificationToken = null;
      return true;
    }
    return false;
  }
  
  generateToken() {
    return Math.random().toString(36).substring(2);
  }
}

// 用户偏好设置类 - 处理偏好设置
class UserPreferences {
  constructor(user) {
    this.user = user;
    this.preferences = {};
  }
  
  setPreference(key, value) {
    this.preferences[key] = value;
  }
  
  getPreference(key) {
    return this.preferences[key];
  }
  
  getAllPreferences() {
    return { ...this.preferences };
  }
  
  clearPreference(key) {
    delete this.preferences[key];
  }
}

// 用户服务类 - 整合各个管理类
class UserService {
  constructor(user) {
    this.user = user;
    this.loginSecurity = new LoginSecurity(user);
    this.passwordReset = new PasswordResetManager(user);
    this.emailVerification = new EmailVerificationManager(user);
    this.preferences = new UserPreferences(user);
  }
  
  // 提供统一的接口
  async login(password) {
    return this.loginSecurity.login(password);
  }
  
  async requestPasswordReset() {
    return this.passwordReset.requestReset();
  }
  
  async resetPassword(token, newPassword) {
    return this.passwordReset.resetPassword(token, newPassword);
  }
  
  async requestEmailVerification() {
    return this.emailVerification.requestVerification();
  }
  
  async verifyEmail(token) {
    return this.emailVerification.verifyEmail(token);
  }
  
  setPreference(key, value) {
    this.preferences.setPreference(key, value);
  }
  
  getPreference(key) {
    return this.preferences.getPreference(key);
  }
  
  // 获取完整的用户信息
  getUserInfo() {
    return {
      profile: this.user.getProfile(),
      security: this.loginSecurity.getSecurityInfo(),
      preferences: this.preferences.getAllPreferences(),
      isEmailVerified: this.user.isEmailVerified
    };
  }
}

// 使用示例 - 代码变得清晰
const user = new User('张三', 'zhangsan@example.com');
const userService = new UserService(user);

// 正常使用场景 - 各个管理类按需初始化
console.log(userService.getUserInfo());

// 登录场景 - 使用专门的管理类
try {
  const loginResult = await userService.login('correct_password');
  console.log('登录结果:', loginResult);
} catch (error) {
  console.error('登录失败:', error.message);
}

// 重置密码场景 - 使用专门的管理类
const resetToken = await userService.requestPasswordReset();
console.log('重置令牌:', resetToken);

// 验证邮箱场景 - 使用专门的管理类
const verifyToken = await userService.requestEmailVerification();
console.log('验证令牌:', verifyToken);

// 偏好设置场景 - 使用专门的管理类
userService.setPreference('theme', 'dark');
userService.setPreference('language', 'zh-CN');

console.log('当前主题:', userService.getPreference('theme'));

// 获取完整信息 - 各个管理类提供各自的数据
console.log('完整用户信息:', userService.getUserInfo());

// 6. 会话管理类 - 处理会话相关的临时字段
class SessionManager {
  constructor(user) {
    this.user = user;
    this.sessions = new Map();
  }
  
  createSession() {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      userId: this.user.id,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }
  
  validateSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return false;
    }
    
    session.lastActivity = new Date();
    return true;
  }
  
  invalidateSession(sessionId) {
    this.sessions.delete(sessionId);
  }
  
  invalidateAllSessions() {
    this.sessions.clear();
  }
  
  getActiveSessions() {
    return Array.from(this.sessions.values()).filter(session => 
      session.expiresAt > new Date()
    );
  }
  
  generateSessionId() {
    return Math.random().toString(36).substring(2) + 
           Math.random().toString(36).substring(2);
  }
}

// 扩展用户服务类
class ExtendedUserService extends UserService {
  constructor(user) {
    super(user);
    this.sessionManager = new SessionManager(user);
  }
  
  createSession() {
    return this.sessionManager.createSession();
  }
  
  validateSession(sessionId) {
    return this.sessionManager.validateSession(sessionId);
  }
  
  logout(sessionId) {
    this.sessionManager.invalidateSession(sessionId);
  }
  
  logoutAll() {
    this.sessionManager.invalidateAllSessions();
  }
  
  getActiveSessions() {
    return this.sessionManager.getActiveSessions();
  }
}
```

## 课后练习

1. **临时字段识别**：找出你项目中的临时字段
2. **类提取**：将临时字段和相关方法提取到专门的类中
3. **职责分离**：确保每个类有明确的单一职责
4. **接口设计**：设计清晰的接口来管理不同场景

**练习代码**：
```javascript
// 重构以下代码，解决临时字段问题
class Order {
  constructor(customer, items) {
    this.customer = customer;
    this.items = items;
    this.total = 0;
    
    // 临时字段
    this.discountAmount = 0;     // 只在计算折扣时使用
    this.taxAmount = 0;         // 只在计算税费时使用
    this.shippingCost = 0;      // 只在计算运费时使用
    this.appliedCoupons = [];   // 只在应用优惠券时使用
    this.paymentMethod = null;  // 只在支付时使用
    this.shippingAddress = null; // 只在配送时使用
  }
  
  calculateTotal() {
    // 复杂的计算逻辑，使用多个临时字段
    this.discountAmount = this.calculateDiscount();
    this.taxAmount = this.calculateTax();
    this.shippingCost = this.calculateShipping();
    
    this.total = this.items.reduce((sum, item) => sum + item.price, 0);
    this.total -= this.discountAmount;
    this.total += this.taxAmount;
    this.total += this.shippingCost;
    
    return this.total;
  }
  
  applyCoupon(coupon) {
    this.appliedCoupons.push(coupon);
  }
  
  setPaymentMethod(method) {
    this.paymentMethod = method;
  }
  
  setShippingAddress(address) {
    this.shippingAddress = address;
  }
}