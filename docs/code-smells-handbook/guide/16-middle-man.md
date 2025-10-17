# 16. 中间人 (Middle Man)

中间人是指一个类的大部分方法都只是委托给其他类。

## 问题定义

当一个类的大部分方法都只是简单地将调用委托给其他对象，自身没有实际的业务逻辑时，就出现了中间人坏味道。这种类增加了不必要的抽象层次。

## 典型症状

1. **委托过多**：类中大部分方法都是委托调用
2. **逻辑缺失**：类自身没有业务逻辑
3. **层次过多**：增加了不必要的抽象层次
4. **性能损耗**：额外的调用开销
5. **维护困难**：需要维护不必要的中间层

## 重构方法

### 1. 内联类 (Inline Class)
将中间人类合并到调用者中。

### 2. 移除中间人 (Remove Middle Man)
直接调用目标对象的方法。

### 3. 用继承替代委托 (Replace Delegation with Inheritance)
如果合适，使用继承关系。

### 4. 提取业务逻辑 (Extract Business Logic)
为中间人添加实际的业务逻辑。

### 5. 用策略模式替代条件表达式 (Replace Conditional with Strategy)
用策略模式处理不同的委托场景。

## 实际案例

### 重构前代码

```javascript
// 中间人的典型例子

class User {
  constructor(name, email, userService) {
    this.name = name;
    this.email = email;
    this.userService = userService;
  }
  
  // 中间人方法 - 只是委托给userService
  save() {
    return this.userService.saveUser(this);
  }
  
  updateProfile(profileData) {
    return this.userService.updateUserProfile(this.id, profileData);
  }
  
  changePassword(newPassword) {
    return this.userService.changeUserPassword(this.id, newPassword);
  }
  
  deleteAccount() {
    return this.userService.deleteUser(this.id);
  }
  
  getPermissions() {
    return this.userService.getUserPermissions(this.id);
  }
  
  isActive() {
    return this.userService.isUserActive(this.id);
  }
  
  // 更多委托方法...
  sendNotification(message) {
    return this.userService.sendUserNotification(this.id, message);
  }
  
  addToGroup(groupId) {
    return this.userService.addUserToGroup(this.id, groupId);
  }
  
  removeFromGroup(groupId) {
    return this.userService.removeUserFromGroup(this.id, groupId);
  }
  
  getGroups() {
    return this.userService.getUserGroups(this.id);
  }
  
  // 唯一有实际逻辑的方法
  validate() {
    return this.name && this.email.includes('@');
  }
}

class UserService {
  constructor(database, emailService, permissionService) {
    this.database = database;
    this.emailService = emailService;
    this.permissionService = permissionService;
  }
  
  // 实际的业务逻辑在这里
  saveUser(user) {
    return this.database.save('users', user);
  }
  
  updateUserProfile(userId, profileData) {
    return this.database.update('users', userId, profileData);
  }
  
  changeUserPassword(userId, newPassword) {
    const hashedPassword = this.hashPassword(newPassword);
    return this.database.update('users', userId, { password: hashedPassword });
  }
  
  deleteUser(userId) {
    return this.database.delete('users', userId);
  }
  
  getUserPermissions(userId) {
    return this.permissionService.getPermissionsForUser(userId);
  }
  
  isUserActive(userId) {
    const user = this.database.get('users', userId);
    return user && user.status === 'active';
  }
  
  sendUserNotification(userId, message) {
    const user = this.database.get('users', userId);
    return this.emailService.send(user.email, message);
  }
  
  addUserToGroup(userId, groupId) {
    return this.database.save('user_groups', { userId, groupId });
  }
  
  removeUserFromGroup(userId, groupId) {
    return this.database.delete('user_groups', { userId, groupId });
  }
  
  getUserGroups(userId) {
    return this.database.query('user_groups', { userId });
  }
  
  hashPassword(password) {
    // 简化密码哈希
    return btoa(password);
  }
}

// 使用示例 - 中间人增加了不必要的复杂性
const userService = new UserService(database, emailService, permissionService);
const user = new User('张三', 'zhangsan@example.com', userService);

// 所有操作都通过中间人
await user.save();
await user.updateProfile({ name: '张三丰' });
await user.changePassword('newpassword123');
const permissions = await user.getPermissions();
const isActive = await user.isActive();

// 问题：User类只是UserService的包装器
```

### 重构后代码

```javascript
// 重构后的代码 - 移除中间人，直接调用服务

class User {
  constructor(id, name, email, status = 'active') {
    this.id = id;
    this.name = name;
    this.email = email;
    this.status = status;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
  
  // 只包含核心业务逻辑，不包含数据访问逻辑
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim().length < 2) {
      errors.push('用户名至少需要2个字符');
    }
    
    if (!this.email || !this.email.includes('@')) {
      errors.push('邮箱格式不正确');
    }
    
    if (!['active', 'inactive', 'suspended'].includes(this.status)) {
      errors.push('状态值无效');
    }
    
    return errors.length === 0 ? null : errors;
  }
  
  updateProfile(profileData) {
    if (profileData.name) {
      this.name = profileData.name;
    }
    if (profileData.email) {
      this.email = profileData.email;
    }
    this.updatedAt = new Date();
  }
  
  activate() {
    this.status = 'active';
    this.updatedAt = new Date();
  }
  
  deactivate() {
    this.status = 'inactive';
    this.updatedAt = new Date();
  }
  
  suspend() {
    this.status = 'suspended';
    this.updatedAt = new Date();
  }
  
  // 业务规则
  canChangePassword() {
    return this.status === 'active';
  }
  
  canReceiveNotifications() {
    return this.status === 'active';
  }
  
  // 数据转换
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
  
  // 工厂方法
  static createFromData(data) {
    return new User(
      data.id,
      data.name,
      data.email,
      data.status
    );
  }
}

// 直接使用服务类，不通过中间人
class UserService {
  constructor(database, emailService, permissionService) {
    this.database = database;
    this.emailService = emailService;
    this.permissionService = permissionService;
  }
  
  // 直接操作User对象
  async saveUser(user) {
    const errors = user.validate();
    if (errors) {
      throw new Error(`用户数据无效: ${errors.join(', ')}`);
    }
    
    return await this.database.save('users', user.toJSON());
  }
  
  async getUser(userId) {
    const userData = await this.database.get('users', userId);
    return userData ? User.createFromData(userData) : null;
  }
  
  async updateUserProfile(userId, profileData) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    user.updateProfile(profileData);
    return await this.saveUser(user);
  }
  
  async changeUserPassword(userId, newPassword) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    if (!user.canChangePassword()) {
      throw new Error('用户当前状态不能修改密码');
    }
    
    const hashedPassword = this.hashPassword(newPassword);
    return await this.database.update('users', userId, { 
      password: hashedPassword,
      updatedAt: new Date()
    });
  }
  
  async deleteUser(userId) {
    return await this.database.delete('users', userId);
  }
  
  async getUserPermissions(userId) {
    return await this.permissionService.getPermissionsForUser(userId);
  }
  
  async isUserActive(userId) {
    const user = await this.getUser(userId);
    return user ? user.status === 'active' : false;
  }
  
  async sendUserNotification(userId, message) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    if (!user.canReceiveNotifications()) {
      throw new Error('用户当前状态不能接收通知');
    }
    
    return await this.emailService.send(user.email, message);
  }
  
  async addUserToGroup(userId, groupId) {
    return await this.database.save('user_groups', { userId, groupId });
  }
  
  async removeUserFromGroup(userId, groupId) {
    return await this.database.delete('user_groups', { userId, groupId });
  }
  
  async getUserGroups(userId) {
    return await this.database.query('user_groups', { userId });
  }
  
  hashPassword(password) {
    return btoa(password);
  }
  
  // 批量操作
  async getActiveUsers() {
    const usersData = await this.database.query('users', { status: 'active' });
    return usersData.map(data => User.createFromData(data));
  }
  
  async sendBulkNotification(userIds, message) {
    const results = [];
    
    for (const userId of userIds) {
      try {
        const result = await this.sendUserNotification(userId, message);
        results.push({ userId, success: true, result });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }
    
    return results;
  }
}

// 使用示例 - 直接调用服务，不通过中间人
const userService = new UserService(database, emailService, permissionService);

// 创建用户对象（纯数据对象）
const user = new User(null, '张三', 'zhangsan@example.com');

// 直接通过服务保存用户
await userService.saveUser(user);

// 直接通过服务进行各种操作
await userService.updateUserProfile(user.id, { name: '张三丰' });
await userService.changeUserPassword(user.id, 'newpassword123');

const permissions = await userService.getUserPermissions(user.id);
const isActive = await userService.isUserActive(user.id);

// 批量操作
const activeUsers = await userService.getActiveUsers();
const notificationResults = await userService.sendBulkNotification(
  activeUsers.map(u => u.id),
  '系统维护通知'
);

// 2. 使用领域服务处理复杂业务逻辑
class UserRegistrationService {
  constructor(userService, validationService, notificationService) {
    this.userService = userService;
    this.validationService = validationService;
    this.notificationService = notificationService;
  }
  
  async registerUser(registrationData) {
    // 验证注册数据
    const validationResult = await this.validationService.validateRegistration(registrationData);
    if (!validationResult.isValid) {
      throw new Error(`注册数据无效: ${validationResult.errors.join(', ')}`);
    }
    
    // 创建用户
    const user = new User(
      null,
      registrationData.name,
      registrationData.email
    );
    
    // 保存用户
    const savedUser = await this.userService.saveUser(user);
    
    // 发送欢迎邮件
    await this.notificationService.sendWelcomeEmail(savedUser.email);
    
    // 记录注册事件
    await this.notificationService.logRegistrationEvent(savedUser.id);
    
    return savedUser;
  }
  
  async registerUserWithInvite(inviteCode, userData) {
    // 验证邀请码
    const invite = await this.validationService.validateInviteCode(inviteCode);
    if (!invite.isValid) {
      throw new Error('邀请码无效或已过期');
    }
    
    // 注册用户
    const user = await this.registerUser(userData);
    
    // 关联邀请关系
    await this.userService.linkUserToInvite(user.id, inviteCode);
    
    return user;
  }
}

// 3. 使用查询服务处理数据查询
class UserQueryService {
  constructor(userService, permissionService, groupService) {
    this.userService = userService;
    this.permissionService = permissionService;
    this.groupService = groupService;
  }
  
  async getUserWithDetails(userId) {
    const user = await this.userService.getUser(userId);
    if (!user) return null;
    
    const permissions = await this.userService.getUserPermissions(userId);
    const groups = await this.userService.getUserGroups(userId);
    const groupDetails = await Promise.all(
      groups.map(group => this.groupService.getGroupDetails(group.groupId))
    );
    
    return {
      user: user.toJSON(),
      permissions,
      groups: groupDetails
    };
  }
  
  async searchUsers(criteria) {
    const users = await this.userService.searchUsers(criteria);
    
    const usersWithDetails = await Promise.all(
      users.map(async user => ({
        user: user.toJSON(),
        permissions: await this.userService.getUserPermissions(user.id),
        isActive: user.status === 'active'
      }))
    );
    
    return usersWithDetails;
  }
}

// 使用专门的服务
const registrationService = new UserRegistrationService(
  userService, validationService, notificationService
);

const userQueryService = new UserQueryService(
  userService, permissionService, groupService
);

// 注册新用户
const newUser = await registrationService.registerUser({
  name: '李四',
  email: 'lisi@example.com'
});

// 查询用户详情
const userDetails = await userQueryService.getUserWithDetails(newUser.id);
console.log('用户详情:', userDetails);
```

## 课后练习

1. **中间人识别**：找出你项目中的中间人类
2. **内联重构**：将中间人类的方法内联到调用者中
3. **职责分离**：确保每个类有明确的职责
4. **服务设计**：设计专门的服务类处理复杂业务

**练习代码**：
```javascript
// 重构以下代码，解决中间人问题
class OrderProcessor {
  constructor(paymentService, inventoryService, shippingService) {
    this.paymentService = paymentService;
    this.inventoryService = inventoryService;
    this.shippingService = shippingService;
  }
  
  // 中间人方法 - 只是委托
  processPayment(order) {
    return this.paymentService.process(order);
  }
  
  checkInventory(productId) {
    return this.inventoryService.checkStock(productId);
  }
  
  scheduleShipping(order) {
    return this.shippingService.schedule(order);
  }
  
  // 更多委托方法...
}