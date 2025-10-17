# 24. 循环复杂度 (Cyclomatic Complexity)

循环复杂度是衡量代码中条件逻辑复杂度的指标，过高的循环复杂度表明代码难以理解和测试。

## 问题定义

循环复杂度是通过计算代码中线性独立路径的数量来衡量代码复杂度的指标。它反映了代码中条件判断的数量和复杂度。

## 典型症状

1. **嵌套条件**：多层if-else嵌套
2. **复杂条件**：使用&&、||等逻辑运算符的复杂条件
3. **多分支语句**：switch语句或if-else链
4. **循环嵌套**：多层循环嵌套
5. **异常处理**：复杂的try-catch块

## 重构方法

### 1. 提取方法 (Extract Method)
将复杂条件逻辑提取为独立方法。

### 2. 使用卫语句 (Guard Clauses)
使用提前返回简化条件逻辑。

### 3. 策略模式 (Strategy Pattern)
使用策略模式替代复杂条件判断。

### 4. 状态模式 (State Pattern)
使用状态模式管理复杂状态转换。

### 5. 表驱动方法 (Table-Driven Methods)
使用配置表替代条件判断。

### 6. 多态 (Polymorphism)
使用多态替代类型检查。

## 实际案例

### 重构前代码

```javascript
// 高循环复杂度的典型例子

// 用户权限验证函数
function checkUserPermission(user, action, resource) {
  let hasPermission = false;
  
  // 检查用户状态
  if (user.status === 'active') {
    // 检查用户角色
    if (user.role === 'admin') {
      hasPermission = true;
    } else if (user.role === 'editor') {
      // 检查具体操作权限
      if (action === 'read' || action === 'write') {
        // 检查资源类型
        if (resource.type === 'article' || resource.type === 'comment') {
          // 检查资源所有者
          if (resource.ownerId === user.id || resource.isPublic) {
            hasPermission = true;
          } else if (resource.collaborators && resource.collaborators.includes(user.id)) {
            hasPermission = true;
          }
        }
      } else if (action === 'delete') {
        // 只能删除自己的资源
        if (resource.ownerId === user.id) {
          hasPermission = true;
        }
      }
    } else if (user.role === 'viewer') {
      if (action === 'read') {
        if (resource.isPublic || resource.ownerId === user.id) {
          hasPermission = true;
        }
      }
    }
  } else if (user.status === 'pending') {
    // 待审核用户只有读取公开资源的权限
    if (action === 'read' && resource.isPublic) {
      hasPermission = true;
    }
  }
  
  return hasPermission;
}

// 订单状态处理函数
function processOrderStatus(order, action, userRole) {
  let newStatus = order.status;
  let message = '';
  
  // 复杂的订单状态转换逻辑
  if (order.status === 'pending') {
    if (action === 'approve') {
      if (userRole === 'admin' || userRole === 'manager') {
        newStatus = 'approved';
        message = '订单已批准';
      } else {
        message = '权限不足';
      }
    } else if (action === 'reject') {
      if (userRole === 'admin' || userRole === 'manager') {
        newStatus = 'rejected';
        message = '订单已拒绝';
      } else {
        message = '权限不足';
      }
    } else if (action === 'cancel') {
      if (order.userId === userRole.id) {
        newStatus = 'cancelled';
        message = '订单已取消';
      } else {
        message = '只能取消自己的订单';
      }
    }
  } else if (order.status === 'approved') {
    if (action === 'ship') {
      if (userRole === 'admin' || userRole === 'shipper') {
        newStatus = 'shipped';
        message = '订单已发货';
      } else {
        message = '权限不足';
      }
    } else if (action === 'cancel') {
      if (userRole === 'admin' || order.userId === userRole.id) {
        newStatus = 'cancelled';
        message = '订单已取消';
      } else {
        message = '权限不足';
      }
    }
  } else if (order.status === 'shipped') {
    if (action === 'deliver') {
      if (userRole === 'admin' || userRole === 'delivery') {
        newStatus = 'delivered';
        message = '订单已送达';
      } else {
        message = '权限不足';
      }
    } else if (action === 'return') {
      if (userRole === 'admin' || order.userId === userRole.id) {
        newStatus = 'returned';
        message = '订单已退货';
      } else {
        message = '权限不足';
      }
    }
  } else if (order.status === 'delivered') {
    if (action === 'complete') {
      if (userRole === 'admin' || order.userId === userRole.id) {
        newStatus = 'completed';
        message = '订单已完成';
      } else {
        message = '权限不足';
      }
    } else if (action === 'return') {
      if (userRole === 'admin' || order.userId === userRole.id) {
        newStatus = 'returned';
        message = '订单已退货';
      } else {
        message = '权限不足';
      }
    }
  }
  
  return { newStatus, message };
}

// 复杂的数据验证函数
function validateUserData(user) {
  const errors = [];
  
  // 用户名验证
  if (!user.username) {
    errors.push('用户名不能为空');
  } else {
    if (user.username.length < 3) {
      errors.push('用户名至少3个字符');
    }
    if (user.username.length > 20) {
      errors.push('用户名不能超过20个字符');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(user.username)) {
      errors.push('用户名只能包含字母、数字和下划线');
    }
  }
  
  // 邮箱验证
  if (!user.email) {
    errors.push('邮箱不能为空');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      errors.push('邮箱格式不正确');
    }
  }
  
  // 密码验证
  if (!user.password) {
    errors.push('密码不能为空');
  } else {
    if (user.password.length < 8) {
      errors.push('密码至少8个字符');
    }
    if (user.password.length > 50) {
      errors.push('密码不能超过50个字符');
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(user.password)) {
      errors.push('密码必须包含大小写字母和数字');
    }
  }
  
  // 年龄验证
  if (user.age !== undefined) {
    if (typeof user.age !== 'number') {
      errors.push('年龄必须是数字');
    } else {
      if (user.age < 0) {
        errors.push('年龄不能为负数');
      }
      if (user.age > 150) {
        errors.push('年龄不能超过150岁');
      }
      if (user.age < 18) {
        errors.push('必须年满18岁');
      }
    }
  }
  
  return errors;
}

// 复杂的业务规则计算
function calculateInsurancePremium(customer, policy) {
  let premium = policy.basePremium;
  
  // 年龄因素
  if (customer.age < 25) {
    premium *= 1.5; // 年轻驾驶员风险高
  } else if (customer.age >= 25 && customer.age < 65) {
    premium *= 1.0; // 标准费率
  } else if (customer.age >= 65) {
    premium *= 1.3; // 年长驾驶员风险高
  }
  
  // 驾驶经验
  if (customer.drivingExperience < 1) {
    premium *= 2.0; // 新手风险极高
  } else if (customer.drivingExperience >= 1 && customer.drivingExperience < 3) {
    premium *= 1.5; // 经验不足
  } else if (customer.drivingExperience >= 3 && customer.drivingExperience < 10) {
    premium *= 1.0; // 标准费率
  } else {
    premium *= 0.9; // 经验丰富有折扣
  }
  
  // 车辆类型
  if (policy.vehicleType === 'sports') {
    premium *= 1.8; // 跑车风险高
  } else if (policy.vehicleType === 'suv') {
    premium *= 1.3; // SUV风险较高
  } else if (policy.vehicleType === 'sedan') {
    premium *= 1.0; // 轿车标准
  } else if (policy.vehicleType === 'electric') {
    premium *= 1.2; // 电动车风险较高
  }
  
  // 使用场景
  if (policy.usage === 'commercial') {
    premium *= 1.5; // 商业用途风险高
  } else if (policy.usage === 'commute') {
    premium *= 1.2; // 通勤风险较高
  } else if (policy.usage === 'pleasure') {
    premium *= 1.0; // 休闲用途标准
  }
  
  // 历史记录
  if (customer.accidentHistory > 2) {
    premium *= 2.0; // 多次事故风险极高
  } else if (customer.accidentHistory > 0) {
    premium *= 1.5; // 有事故记录风险高
  }
  
  // 信用评分
  if (customer.creditScore < 600) {
    premium *= 1.4; // 信用差风险高
  } else if (customer.creditScore >= 600 && customer.creditScore < 700) {
    premium *= 1.1; // 信用一般
  } else {
    premium *= 0.9; // 信用良好有折扣
  }
  
  return Math.round(premium * 100) / 100; // 保留两位小数
}

// 使用示例
const user = {
  status: 'active',
  role: 'editor',
  id: 'user123'
};

const resource = {
  type: 'article',
  ownerId: 'user123',
  isPublic: true
};

console.log('权限检查:', checkUserPermission(user, 'write', resource));

const order = {
  status: 'pending',
  userId: 'user123'
};

console.log('订单处理:', processOrderStatus(order, 'approve', 'manager'));

const userData = {
  username: 'test_user',
  email: 'test@example.com',
  password: 'Password123',
  age: 25
};

console.log('数据验证:', validateUserData(userData));

const customer = {
  age: 30,
  drivingExperience: 5,
  accidentHistory: 0,
  creditScore: 750
};

const policy = {
  basePremium: 1000,
  vehicleType: 'sedan',
  usage: 'commute'
};

console.log('保险费用:', calculateInsurancePremium(customer, policy));

// 问题：这些函数都有很高的循环复杂度，难以理解和测试
```

### 重构后代码

```javascript
// 重构后的代码 - 降低循环复杂度

// 1. 权限验证 - 使用策略模式

class PermissionChecker {
  static ROLES = {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer'
  };
  
  static ACTIONS = {
    READ: 'read',
    WRITE: 'write',
    DELETE: 'delete'
  };
  
  static check(user, action, resource) {
    const strategy = this.getStrategy(user.role);
    return strategy.check(user, action, resource);
  }
  
  static getStrategy(role) {
    const strategies = {
      [this.ROLES.ADMIN]: new AdminPermissionStrategy(),
      [this.ROLES.EDITOR]: new EditorPermissionStrategy(),
      [this.ROLES.VIEWER]: new ViewerPermissionStrategy()
    };
    
    return strategies[role] || new BasePermissionStrategy();
  }
}

class BasePermissionStrategy {
  check(user, action, resource) {
    if (user.status !== 'active') {
      return false;
    }
    return this.hasSpecificPermission(user, action, resource);
  }
  
  hasSpecificPermission(user, action, resource) {
    return false; // 基类默认无权限
  }
}

class AdminPermissionStrategy extends BasePermissionStrategy {
  hasSpecificPermission(user, action, resource) {
    return true; // 管理员拥有所有权限
  }
}

class EditorPermissionStrategy extends BasePermissionStrategy {
  hasSpecificPermission(user, action, resource) {
    const allowedActions = [PermissionChecker.ACTIONS.READ, PermissionChecker.ACTIONS.WRITE];
    
    if (!allowedActions.includes(action)) {
      return false;
    }
    
    const allowedResourceTypes = ['article', 'comment'];
    if (!allowedResourceTypes.includes(resource.type)) {
      return false;
    }
    
    return resource.ownerId === user.id || 
           resource.isPublic || 
           (resource.collaborators && resource.collaborators.includes(user.id));
  }
}

class ViewerPermissionStrategy extends BasePermissionStrategy {
  hasSpecificPermission(user, action, resource) {
    if (action !== PermissionChecker.ACTIONS.READ) {
      return false;
    }
    
    return resource.isPublic || resource.ownerId === user.id;
  }
}

// 2. 订单状态处理 - 使用状态模式

class OrderStateMachine {
  constructor(order) {
    this.order = order;
    this.states = {
      pending: new PendingState(),
      approved: new ApprovedState(),
      shipped: new ShippedState(),
      delivered: new DeliveredState(),
      cancelled: new CancelledState(),
      completed: new CompletedState(),
      returned: new ReturnedState()
    };
  }
  
  process(action, userRole) {
    const currentState = this.states[this.order.status];
    if (!currentState) {
      return { newStatus: this.order.status, message: '无效的订单状态' };
    }
    
    return currentState.process(this.order, action, userRole);
  }
}

class OrderState {
  process(order, action, userRole) {
    return { newStatus: order.status, message: '操作不被允许' };
  }
  
  hasPermission(userRole, allowedRoles) {
    return allowedRoles.includes(userRole);
  }
}

class PendingState extends OrderState {
  process(order, action, userRole) {
    switch (action) {
      case 'approve':
        if (this.hasPermission(userRole, ['admin', 'manager'])) {
          return { newStatus: 'approved', message: '订单已批准' };
        }
        return { newStatus: 'pending', message: '权限不足' };
        
      case 'reject':
        if (this.hasPermission(userRole, ['admin', 'manager'])) {
          return { newStatus: 'rejected', message: '订单已拒绝' };
        }
        return { newStatus: 'pending', message: '权限不足' };
        
      case 'cancel':
        if (order.userId === userRole.id || this.hasPermission(userRole, ['admin'])) {
          return { newStatus: 'cancelled', message: '订单已取消' };
        }
        return { newStatus: 'pending', message: '只能取消自己的订单' };
        
      default:
        return { newStatus: 'pending', message: '无效操作' };
    }
  }
}

class ApprovedState extends OrderState {
  process(order, action, userRole) {
    switch (action) {
      case 'ship':
        if (this.hasPermission(userRole, ['admin', 'shipper'])) {
          return { newStatus: 'shipped', message: '订单已发货' };
        }
        return { newStatus: 'approved', message: '权限不足' };
        
      case 'cancel':
        if (order.userId === userRole.id || this.hasPermission(userRole, ['admin'])) {
          return { newStatus: 'cancelled', message: '订单已取消' };
        }
        return { newStatus: 'approved', message: '权限不足' };
        
      default:
        return { newStatus: 'approved', message: '无效操作' };
    }
  }
}

// 其他状态类实现类似...

// 3. 数据验证 - 使用验证器模式

class UserDataValidator {
  static VALIDATORS = [
    new UsernameValidator(),
    new EmailValidator(),
    new PasswordValidator(),
    new AgeValidator()
  ];
  
  static validate(user) {
    const errors = [];
    
    for (const validator of this.VALIDATORS) {
      const result = validator.validate(user);
      if (!result.isValid) {
        errors.push(result.message);
      }
    }
    
    return errors;
  }
}

class BaseValidator {
  validate(user) {
    return { isValid: true, message: '' };
  }
}

class UsernameValidator extends BaseValidator {
  validate(user) {
    if (!user.username) {
      return { isValid: false, message: '用户名不能为空' };
    }
    
    if (user.username.length < 3) {
      return { isValid: false, message: '用户名至少3个字符' };
    }
    
    if (user.username.length > 20) {
      return { isValid: false, message: '用户名不能超过20个字符' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(user.username)) {
      return { isValid: false, message: '用户名只能包含字母、数字和下划线' };
    }
    
    return { isValid: true, message: '' };
  }
}

class EmailValidator extends BaseValidator {
  validate(user) {
    if (!user.email) {
      return { isValid: false, message: '邮箱不能为空' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return { isValid: false, message: '邮箱格式不正确' };
    }
    
    return { isValid: true, message: '' };
  }
}

// 密码和年龄验证器类似...

// 4. 保险费用计算 - 使用配置表

class InsuranceCalculator {
  static FACTORS = {
    age: [
      { range: [0, 25], factor: 1.5 },
      { range: [25, 65], factor: 1.0 },
      { range: [65, 150], factor: 1.3 }
    ],
    experience: [
      { range: [0, 1], factor: 2.0 },
      { range: [1, 3], factor: 1.5 },
      { range: [3, 10], factor: 1.0 },
      { range: [10, Infinity], factor: 0.9 }
    ],
    vehicleType: {
      sports: 1.8,
      suv: 1.3,
      sedan: 1.0,
      electric: 1.2
    },
    usage: {
      commercial: 1.5,
      commute: 1.2,
      pleasure: 1.0
    },
    accidents: [
      { range: [3, Infinity], factor: 2.0 },
      { range: [1, 3], factor: 1.5 },
      { range: [0, 1], factor: 1.0 }
    ],
    credit: [
      { range: [0, 600], factor: 1.4 },
      { range: [600, 700], factor: 1.1 },
      { range: [700, 850], factor: 0.9 }
    ]
  };
  
  static calculate(customer, policy) {
    let premium = policy.basePremium;
    
    premium *= this.getFactor('age', customer.age);
    premium *= this.getFactor('experience', customer.drivingExperience);
    premium *= this.FACTORS.vehicleType[policy.vehicleType] || 1.0;
    premium *= this.FACTORS.usage[policy.usage] || 1.0;
    premium *= this.getFactor('accidents', customer.accidentHistory);
    premium *= this.getFactor('credit', customer.creditScore);
    
    return Math.round(premium * 100) / 100;
  }
  
  static getFactor(type, value) {
    const factors = this.FACTORS[type];
    
    if (Array.isArray(factors)) {
      const factor = factors.find(f => 
        value >= f.range[0] && value < f.range[1]
      );
      return factor ? factor.factor : 1.0;
    }
    
    return factors[value] || 1.0;
  }
}

// 5. 卫语句重构示例

class UserService {
  // 重构前 - 嵌套条件
  processUserOld(user) {
    if (user) {
      if (user.isActive) {
        if (user.hasSubscription) {
          if (user.subscription.isValid) {
            return this.sendWelcomeEmail(user);
          } else {
            return this.sendRenewalReminder(user);
          }
        } else {
          return this.sendSubscriptionOffer(user);
        }
      } else {
        return this.sendActivationEmail(user);
      }
    }
    return null;
  }
  
  // 重构后 - 使用卫语句
  processUser(user) {
    if (!user) return null;
    if (!user.isActive) return this.sendActivationEmail(user);
    if (!user.hasSubscription) return this.sendSubscriptionOffer(user);
    if (!user.subscription.isValid) return this.sendRenewalReminder(user);
    
    return this.sendWelcomeEmail(user);
  }
  
  sendWelcomeEmail(user) {
    console.log('发送欢迎邮件给:', user.email);
    return 'welcome_sent';
  }
  
  sendRenewalReminder(user) {
    console.log('发送续订提醒给:', user.email);
    return 'renewal_reminder_sent';
  }
  
  sendSubscriptionOffer(user) {
    console.log('发送订阅优惠给:', user.email);
    return 'subscription_offer_sent';
  }
  
  sendActivationEmail(user) {
    console.log('发送激活邮件给:', user.email);
    return 'activation_sent';
  }
}

// 6. 循环复杂度计算工具

class ComplexityAnalyzer {
  static calculateComplexity(code) {
    // 简化版的循环复杂度计算
    let complexity = 1; // 基础复杂度
    
    const patterns = {
      if: /if\s*\(/g,
      for: /for\s*\(/g,
      while: /while\s*\(/g,
      case: /case\s+/g,
      catch: /catch\s*\(/g,
      and: /&&/g,
      or: /\|\|/g
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return complexity;
  }
  
  static getComplexityLevel(complexity) {
    if (complexity <= 10) return '低';
    if (complexity <= 20) return '中';
    if (complexity <= 50) return '高';
    return '极高';
  }
}

// 使用示例
console.log('权限检查:', PermissionChecker.check(user, 'write', resource));

const orderMachine = new OrderStateMachine(order);
console.log('订单处理:', orderMachine.process('approve', 'manager'));

console.log('数据验证:', UserDataValidator.validate(userData));

console.log('保险费用:', InsuranceCalculator.calculate(customer, policy));

const userService = new UserService();
const testUser = {
  isActive: true,
  hasSubscription: true,
  subscription: { isValid: true },
  email: 'test@example.com'
};

console.log('用户处理:', userService.processUser(testUser));

// 复杂度分析示例
const sampleCode = `
function test(a, b) {
  if (a > 0) {
    if (b > 0) {
      return a + b;
    } else {
      return a - b;
    }
  } else if (a < 0) {
    return -a;
  } else {
    return 0;
  }
}
`;

console.log('代码复杂度:', 
  ComplexityAnalyzer.calculateComplexity(sampleCode),
  ComplexityAnalyzer.getComplexityLevel(
    ComplexityAnalyzer.calculateComplexity(sampleCode)
  )
);

// 重构后的代码优势：
// 1. 每个方法职责单一
// 2. 条件逻辑清晰易懂
// 3. 易于测试和维护
// 4. 支持扩展和修改
```

## 课后练习

1. **分析复杂度**：计算现有代码的循环复杂度
2. **使用卫语句**：重构嵌套条件逻辑
3. **策略模式**：实现复杂的业务规则
4. **状态模式**：管理复杂的状态转换

**练习代码**：
```javascript
// 重构以下高复杂度代码
function calculateGrade(score, attendance, assignments) {
  let grade = 'F';
  
  if (score >= 90) {
    if (attendance >= 0.9) {
      if (assignments >= 8) {
        grade = 'A';
      } else if (assignments >= 6) {
        grade = 'B';
      } else {
        grade = 'C';
      }
    } else if (attendance >= 0.7) {
      if (assignments >= 8) {
        grade = 'B';
      } else if (assignments >= 6) {
        grade = 'C';
      } else {
        grade = 'D';
      }
    } else {
      grade = 'F';
    }
  } else if (score >= 80) {
    if (attendance >= 0.9) {
      if (assignments >= 8) {
        grade = 'B';
      } else if (assignments >= 6) {
        grade = 'C';
      } else {
        grade = 'D';
      }
    } else if (attendance >= 0.7) {
      if (assignments >= 8) {
        grade = 'C';
      } else if (assignments >= 6) {
        grade = 'D';
      } else {
        grade = 'F';
      }
    } else {
      grade = 'F';
    }
  } else if (score >= 70) {
    if (attendance >= 0.9) {
      if (assignments >= 8) {
        grade = 'C';
      } else if (assignments >= 6) {
        grade = 'D';
      } else {
        grade = 'F';
      }
    } else if (attendance >= 0.7) {
      if (assignments >= 8) {
        grade = 'D';
      } else {
        grade = 'F';
      }
    } else {
      grade = 'F';
    }
  }
  
  return grade;
}

// 重构提示：
// 1. 使用卫语句提前返回
// 2. 提取条件判断为独立方法
// 3. 使用配置表定义评分规则
// 4. 考虑使用策略模式

**进阶练习**：
```javascript
// 创建一个完整的复杂度分析工具
class AdvancedComplexityAnalyzer {
  // 实现以下功能：
  // 1. 分析函数复杂度
  // 2. 识别高复杂度代码块
  // 3. 提供重构建议
  // 4. 生成复杂度报告
}

// 使用你的工具分析项目中的代码复杂度
```

通过降低循环复杂度，代码变得更加清晰、可维护，并且更容易进行单元测试。