# 3. 过大的类 (Large Class)

过大的类是指一个类承担了过多的职责，包含了过多的字段和方法。

## 问题定义

当一个类试图做太多事情，拥有过多的字段和方法时，就出现了过大的类的坏味道。这种类违反了单一职责原则，难以维护和测试。

## 典型症状

1. **字段过多**：类包含大量不相关的字段
2. **方法过多**：类有数十个甚至上百个方法
3. **职责混杂**：一个类处理多个不相关的业务逻辑
4. **修改频繁**：因为承担过多职责，经常需要修改
5. **测试困难**：测试用例复杂，需要大量模拟

## 重构方法

### 1. 提取类 (Extract Class)
将相关的字段和方法提取到新的类中。

### 2. 提取子类 (Extract Subclass)
将特定行为提取到子类中。

### 3. 提取接口 (Extract Interface)
定义清晰的接口来分离职责。

### 4. 用委托替代继承 (Replace Inheritance with Delegation)
使用组合而不是继承来复用代码。

### 5. 用策略对象替换条件逻辑 (Replace Conditional with Polymorphism)
使用多态来消除复杂的条件判断。

## 实际案例

### 重构前代码

```javascript
class UserManager {
  constructor() {
    // 用户管理相关字段
    this.users = [];
    this.currentUser = null;
    this.userPreferences = {};
    
    // 认证相关字段
    this.authToken = null;
    this.refreshToken = null;
    this.loginAttempts = 0;
    
    // 通知相关字段
    this.notificationSettings = {};
    this.pushSubscriptions = [];
    this.emailTemplates = {};
    
    // 数据分析字段
    this.userAnalytics = {};
    this.behaviorTracking = [];
    this.engagementMetrics = {};
  }
  
  // 用户管理方法（15个）
  addUser(user) { /* ... */ }
  removeUser(userId) { /* ... */ }
  updateUser(userId, updates) { /* ... */ }
  findUserById(userId) { /* ... */ }
  findUserByEmail(email) { /* ... */ }
  // ... 更多用户管理方法
  
  // 认证方法（10个）
  login(email, password) { /* ... */ }
  logout() { /* ... */ }
  refreshAuthToken() { /* ... */ }
  validateToken(token) { /* ... */ }
  resetPassword(email) { /* ... */ }
  // ... 更多认证方法
  
  // 通知方法（8个）
  sendEmailNotification(userId, template, data) { /* ... */ }
  sendPushNotification(userId, message) { /* ... */ }
  updateNotificationSettings(userId, settings) { /* ... */ }
  // ... 更多通知方法
  
  // 数据分析方法（7个）
  trackUserBehavior(userId, event, data) { /* ... */ }
  generateUserReport(userId) { /* ... */ }
  calculateEngagementScore(userId) { /* ... */ }
  // ... 更多数据分析方法
  
  // 工具方法（5个）
  validateEmail(email) { /* ... */ }
  formatUserName(user) { /* ... */ }
  generateRandomPassword() { /* ... */ }
  // ... 更多工具方法
}
```

### 重构后代码

```javascript
// 用户实体类
class User {
  constructor(id, email, preferences = {}) {
    this.id = id;
    this.email = email;
    this.preferences = preferences;
  }
  
  updatePreferences(newPreferences) {
    this.preferences = { ...this.preferences, ...newPreferences };
  }
  
  formatDisplayName() {
    return this.email.split('@')[0];
  }
}

// 认证服务类
class AuthenticationService {
  constructor() {
    this.authToken = null;
    this.refreshToken = null;
    this.loginAttempts = 0;
  }
  
  async login(email, password) {
    // 认证逻辑
    const user = await this.validateCredentials(email, password);
    this.authToken = await this.generateToken(user);
    return user;
  }
  
  logout() {
    this.authToken = null;
    this.refreshToken = null;
  }
  
  async refreshAuthToken() {
    // 刷新令牌逻辑
  }
  
  // 其他认证相关方法...
}

// 通知服务类
class NotificationService {
  constructor() {
    this.notificationSettings = {};
    this.pushSubscriptions = [];
  }
  
  async sendEmail(userId, template, data) {
    // 发送邮件逻辑
  }
  
  async sendPush(userId, message) {
    // 发送推送逻辑
  }
  
  updateSettings(userId, settings) {
    this.notificationSettings[userId] = settings;
  }
  
  // 其他通知相关方法...
}

// 数据分析服务类
class AnalyticsService {
  constructor() {
    this.userAnalytics = {};
    this.behaviorTracking = [];
  }
  
  trackEvent(userId, event, data) {
    this.behaviorTracking.push({
      userId,
      event,
      data,
      timestamp: new Date()
    });
  }
  
  generateReport(userId) {
    // 生成报告逻辑
  }
  
  // 其他分析相关方法...
}

// 工具类
class UserUtils {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static generateRandomPassword(length = 12) {
    // 生成随机密码逻辑
  }
  
  // 其他工具方法...
}

// 重构后的用户管理器（协调各个服务）
class UserManager {
  constructor() {
    this.authService = new AuthenticationService();
    this.notificationService = new NotificationService();
    this.analyticsService = new AnalyticsService();
    this.users = new Map();
  }
  
  async registerUser(userData) {
    // 使用各个服务协同工作
    if (!UserUtils.validateEmail(userData.email)) {
      throw new Error('无效的邮箱地址');
    }
    
    const user = new User(generateId(), userData.email, userData.preferences);
    this.users.set(user.id, user);
    
    await this.authService.setupUserAuth(user.id, userData.password);
    await this.notificationService.setupDefaultNotifications(user.id);
    this.analyticsService.trackEvent(user.id, 'user_registered');
    
    return user;
  }
  
  // 其他协调方法...
}
```

## 课后练习

1. **类分析**：找出你项目中最大的3个类
2. **职责识别**：分析每个类承担的职责数量
3. **提取重构**：将过大的类拆分为多个专注的类
4. **关系设计**：设计类之间的协作关系

**练习代码**：
```javascript
// 重构以下过大的类
class ECommercePlatform {
  constructor() {
    // 产品管理字段
    this.products = [];
    this.categories = [];
    this.inventory = {};
    
    // 订单管理字段
    this.orders = [];
    this.customers = [];
    this.payments = [];
    
    // 用户管理字段
    this.users = [];
    this.userSessions = {};
    
    // 营销字段
    this.promotions = [];
    this.coupons = {};
    this.analytics = {};
  }
  
  // 产品管理方法（需要提取）
  addProduct(product) { /* ... */ }
  updateProduct(id, updates) { /* ... */ }
  deleteProduct(id) { /* ... */ }
  searchProducts(query) { /* ... */ }
  
  // 订单管理方法（需要提取）
  createOrder(customerId, items) { /* ... */ }
  processPayment(orderId, paymentInfo) { /* ... */ }
  updateOrderStatus(orderId, status) { /* ... */ }
  
  // 用户管理方法（需要提取）
  registerUser(userData) { /* ... */ }
  loginUser(email, password) { /* ... */ }
  updateUserProfile(userId, profile) { /* ... */ }
  
  // 营销方法（需要提取）
  createPromotion(details) { /* ... */ }
  applyCoupon(orderId, couponCode) { /* ... */ }
  trackUserBehavior(userId, event) { /* ... */ }
}