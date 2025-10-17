# 4. 过长参数列 (Long Parameter List)

过长参数列是指函数或方法需要传递过多的参数。

## 问题定义

当一个函数需要接收大量参数（通常超过3-5个）才能完成其工作时，就出现了过长参数列的坏味道。这会使函数调用变得复杂，降低代码的可读性和可维护性。

## 典型症状

1. **参数数量过多**：函数参数超过合理数量
2. **参数相关性低**：参数之间没有明显的逻辑关系
3. **调用复杂**：每次调用都需要传递大量参数
4. **默认值滥用**：使用大量默认参数来简化调用
5. **参数顺序敏感**：参数顺序容易出错

## 重构方法

### 1. 引入参数对象 (Introduce Parameter Object)
将相关的参数组合成一个参数对象。

### 2. 保持完整对象 (Preserve Whole Object)
传递整个对象而不是对象的各个属性。

### 3. 以查询取代参数 (Replace Parameter with Query)
通过查询获取参数值而不是传递参数。

### 4. 移除参数 (Remove Parameter)
如果参数不再需要，直接移除。

### 5. 方法对象替换函数 (Replace Method with Method Object)
将函数转换为方法对象。

## 实际案例

### 重构前代码

```javascript
// 过多的参数
function createUser(
  firstName, 
  lastName, 
  email, 
  phone, 
  address, 
  city, 
  state, 
  zipCode, 
  country,
  dateOfBirth,
  gender,
  preferences,
  newsletterSubscription
) {
  // 验证参数
  if (!firstName || !lastName || !email) {
    throw new Error('必填字段不能为空');
  }
  
  // 创建用户逻辑
  const user = {
    personalInfo: {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender
    },
    address: {
      address,
      city,
      state,
      zipCode,
      country
    },
    preferences: preferences || {},
    newsletterSubscription: newsletterSubscription || false
  };
  
  return user;
}

// 调用时非常复杂
const user = createUser(
  '张',
  '三',
  'zhangsan@example.com',
  '13800138000',
  '人民路123号',
  '北京市',
  '北京',
  '100000',
  '中国',
  '1990-01-01',
  'male',
  { theme: 'dark', language: 'zh-CN' },
  true
);
```

### 重构后代码

```javascript
// 使用参数对象
class UserCreationParams {
  constructor(personalInfo, address, preferences = {}, newsletterSubscription = false) {
    this.personalInfo = personalInfo;
    this.address = address;
    this.preferences = preferences;
    this.newsletterSubscription = newsletterSubscription;
  }
  
  validate() {
    if (!this.personalInfo.firstName || !this.personalInfo.lastName || !this.personalInfo.email) {
      throw new Error('必填字段不能为空');
    }
  }
}

// 简化的创建函数
function createUser(params) {
  params.validate();
  
  return {
    personalInfo: params.personalInfo,
    address: params.address,
    preferences: params.preferences,
    newsletterSubscription: params.newsletterSubscription,
    createdAt: new Date()
  };
}

// 或者使用构建器模式
class UserBuilder {
  constructor() {
    this.personalInfo = {};
    this.address = {};
    this.preferences = {};
    this.newsletterSubscription = false;
  }
  
  withPersonalInfo(firstName, lastName, email, phone = '', dateOfBirth = '', gender = '') {
    this.personalInfo = { firstName, lastName, email, phone, dateOfBirth, gender };
    return this;
  }
  
  withAddress(address, city, state, zipCode, country) {
    this.address = { address, city, state, zipCode, country };
    return this;
  }
  
  withPreferences(preferences) {
    this.preferences = preferences;
    return this;
  }
  
  withNewsletterSubscription(subscribed) {
    this.newsletterSubscription = subscribed;
    return this;
  }
  
  build() {
    return createUser(new UserCreationParams(
      this.personalInfo,
      this.address,
      this.preferences,
      this.newsletterSubscription
    ));
  }
}

// 调用变得简洁清晰
const user = new UserBuilder()
  .withPersonalInfo('张', '三', 'zhangsan@example.com', '13800138000')
  .withAddress('人民路123号', '北京市', '北京', '100000', '中国')
  .withPreferences({ theme: 'dark', language: 'zh-CN' })
  .withNewsletterSubscription(true)
  .build();
```

## 课后练习

1. **参数分析**：找出你项目中参数最多的3个函数
2. **对象封装**：将相关参数封装为参数对象
3. **构建器模式**：尝试使用构建器模式简化复杂对象的创建
4. **默认值优化**：合理使用默认参数减少必需参数数量

**练习代码**：
```javascript
// 重构以下函数，减少参数数量
function updateProduct(
  productId,
  name,
  description,
  price,
  category,
  tags,
  inventory,
  images,
  specifications,
  shippingInfo,
  seoData
) {
  // 复杂的更新逻辑
  console.log(`更新产品 ${productId}: ${name}`);
}

// 调用示例
updateProduct(
  12345,
  '智能手机',
  '最新款智能手机',
  2999,
  'electronics',
  ['手机', '智能', '科技'],
  100,
  ['image1.jpg', 'image2.jpg'],
  { color: '黑色', storage: '128GB' },
  { weight: 0.5, dimensions: '15x7x1cm' },
  { title: '智能手机', description: '最新款智能手机' }
);