# 15. 过长的消息链 (Message Chains)

过长的消息链是指通过多个对象的方法调用链来获取数据。

## 问题定义

当代码中出现连续的方法调用，通过多个对象来获取最终的数据时，就出现了过长的消息链坏味道。这种链式调用使得代码与中间对象的内部结构紧密耦合。

## 典型症状

1. **深度调用**：连续调用多个对象的方法
2. **中间依赖**：代码依赖于中间对象的内部结构
3. **脆弱性高**：中间对象的任何变化都会影响调用链
4. **理解困难**：难以理解整个调用链的目的
5. **测试困难**：需要模拟多个中间对象

## 重构方法

### 1. 隐藏委托 (Hide Delegate)
通过委托方法来隐藏中间对象。

### 2. 提取方法 (Extract Method)
将消息链提取为独立的方法。

### 3. 搬移方法 (Move Method)
将方法移动到更合适的位置。

### 4. 用中间人替代委托 (Replace Delegation with Middle Man)
引入中间人来简化调用链。

### 5. 用查询替代临时变量 (Replace Temp with Query)
用查询方法替代临时变量。

## 实际案例

### 重构前代码

```javascript
// 过长的消息链典型例子

class Company {
  constructor(name, departments) {
    this.name = name;
    this.departments = departments;
  }
  
  getDepartment(name) {
    return this.departments.find(dept => dept.name === name);
  }
}

class Department {
  constructor(name, manager, teams) {
    this.name = name;
    this.manager = manager;
    this.teams = teams;
  }
  
  getManager() {
    return this.manager;
  }
  
  getTeam(name) {
    return this.teams.find(team => team.name === name);
  }
}

class Employee {
  constructor(name, position, contactInfo) {
    this.name = name;
    this.position = position;
    this.contactInfo = contactInfo;
  }
  
  getContactInfo() {
    return this.contactInfo;
  }
}

class ContactInfo {
  constructor(email, phone, address) {
    this.email = email;
    this.phone = phone;
    this.address = address;
  }
  
  getEmail() {
    return this.email;
  }
  
  getPhone() {
    return this.phone;
  }
  
  getAddress() {
    return this.address;
  }
}

class Address {
  constructor(street, city, country, zipCode) {
    this.street = street;
    this.city = city;
    this.country = country;
    this.zipCode = zipCode;
  }
  
  getFullAddress() {
    return `${this.street}, ${this.city}, ${this.country} ${this.zipCode}`;
  }
}

// 使用示例 - 过长的消息链
const company = new Company('Tech Corp', [
  new Department('Engineering', 
    new Employee('张三', 'Manager', 
      new ContactInfo('zhangsan@tech.com', '123-456-7890',
        new Address('123 Main St', 'Beijing', 'China', '100000')
      )
    ),
    [
      { name: 'Frontend', members: [] },
      { name: 'Backend', members: [] }
    ]
  )
]);

// 过长的消息链 - 获取经理的邮箱
const managerEmail = company.getDepartment('Engineering')
                          .getManager()
                          .getContactInfo()
                          .getEmail();

console.log('经理邮箱:', managerEmail);

// 过长的消息链 - 获取经理的完整地址
const managerAddress = company.getDepartment('Engineering')
                            .getManager()
                            .getContactInfo()
                            .getAddress()
                            .getFullAddress();

console.log('经理地址:', managerAddress);

// 问题：代码与中间对象结构紧密耦合
```

### 重构后代码

```javascript
// 重构后的代码 - 隐藏委托，简化调用链

class Company {
  constructor(name, departments) {
    this.name = name;
    this.departments = departments;
  }
  
  getDepartment(name) {
    return this.departments.find(dept => dept.name === name);
  }
  
  // 隐藏委托 - 提供直接获取经理信息的方法
  getManagerEmail(departmentName) {
    const department = this.getDepartment(departmentName);
    return department ? department.getManagerEmail() : null;
  }
  
  getManagerPhone(departmentName) {
    const department = this.getDepartment(departmentName);
    return department ? department.getManagerPhone() : null;
  }
  
  getManagerAddress(departmentName) {
    const department = this.getDepartment(departmentName);
    return department ? department.getManagerAddress() : null;
  }
}

class Department {
  constructor(name, manager, teams) {
    this.name = name;
    this.manager = manager;
    this.teams = teams;
  }
  
  getManager() {
    return this.manager;
  }
  
  getTeam(name) {
    return this.teams.find(team => team.name === name);
  }
  
  // 隐藏委托 - 提供直接获取经理信息的方法
  getManagerEmail() {
    return this.manager ? this.manager.getEmail() : null;
  }
  
  getManagerPhone() {
    return this.manager ? this.manager.getPhone() : null;
  }
  
  getManagerAddress() {
    return this.manager ? this.manager.getAddress() : null;
  }
}

class Employee {
  constructor(name, position, contactInfo) {
    this.name = name;
    this.position = position;
    this.contactInfo = contactInfo;
  }
  
  getContactInfo() {
    return this.contactInfo;
  }
  
  // 隐藏委托 - 提供直接获取联系信息的方法
  getEmail() {
    return this.contactInfo ? this.contactInfo.getEmail() : null;
  }
  
  getPhone() {
    return this.contactInfo ? this.contactInfo.getPhone() : null;
  }
  
  getAddress() {
    return this.contactInfo ? this.contactInfo.getAddress() : null;
  }
}

class ContactInfo {
  constructor(email, phone, address) {
    this.email = email;
    this.phone = phone;
    this.address = address;
  }
  
  getEmail() {
    return this.email;
  }
  
  getPhone() {
    return this.phone;
  }
  
  getAddress() {
    return this.address;
  }
  
  // 提供完整的联系信息
  getFullContactInfo() {
    return {
      email: this.email,
      phone: this.phone,
      address: this.address ? this.address.getFullAddress() : null
    };
  }
}

class Address {
  constructor(street, city, country, zipCode) {
    this.street = street;
    this.city = city;
    this.country = country;
    this.zipCode = zipCode;
  }
  
  getFullAddress() {
    return `${this.street}, ${this.city}, ${this.country} ${this.zipCode}`;
  }
}

// 使用示例 - 简化的调用链
const company = new Company('Tech Corp', [
  new Department('Engineering', 
    new Employee('张三', 'Manager', 
      new ContactInfo('zhangsan@tech.com', '123-456-7890',
        new Address('123 Main St', 'Beijing', 'China', '100000')
      )
    ),
    [
      { name: 'Frontend', members: [] },
      { name: 'Backend', members: [] }
    ]
  )
]);

// 简化的调用 - 直接获取经理邮箱
const managerEmail = company.getManagerEmail('Engineering');
console.log('经理邮箱:', managerEmail);

// 简化的调用 - 直接获取经理地址
const managerAddress = company.getManagerAddress('Engineering');
console.log('经理地址:', managerAddress);

// 如果需要完整信息，可以使用专门的方法
const engineeringDept = company.getDepartment('Engineering');
if (engineeringDept) {
  const manager = engineeringDept.getManager();
  if (manager) {
    const contactInfo = manager.getContactInfo().getFullContactInfo();
    console.log('完整联系信息:', contactInfo);
  }
}

// 2. 使用查询方法替代临时变量
class EmployeeService {
  constructor(company) {
    this.company = company;
  }
  
  // 提取查询方法
  getDepartmentManagerContact(departmentName) {
    const department = this.company.getDepartment(departmentName);
    if (!department || !department.getManager()) {
      return null;
    }
    
    const manager = department.getManager();
    const contactInfo = manager.getContactInfo();
    
    return {
      name: manager.name,
      position: manager.position,
      email: contactInfo.getEmail(),
      phone: contactInfo.getPhone(),
      address: contactInfo.getAddress()
    };
  }
  
  // 另一个查询方法
  getAllManagersInfo() {
    return this.company.departments.map(dept => ({
      department: dept.name,
      manager: dept.getManager() ? {
        name: dept.getManager().name,
        email: dept.getManagerEmail(),
        phone: dept.getManagerPhone()
      } : null
    }));
  }
}

// 使用服务类
const employeeService = new EmployeeService(company);
const managerContact = employeeService.getDepartmentManagerContact('Engineering');
console.log('经理联系信息:', managerContact);

const allManagers = employeeService.getAllManagersInfo();
console.log('所有经理信息:', allManagers);

// 3. 使用中间人模式
class CompanyInfoFacade {
  constructor(company) {
    this.company = company;
  }
  
  // 提供简化的接口
  getManagerInfo(departmentName) {
    const department = this.company.getDepartment(departmentName);
    if (!department) return null;
    
    const manager = department.getManager();
    if (!manager) return null;
    
    const contactInfo = manager.getContactInfo();
    return {
      department: departmentName,
      managerName: manager.name,
      position: manager.position,
      contact: contactInfo.getFullContactInfo()
    };
  }
  
  // 批量获取信息
  getDepartmentsSummary() {
    return this.company.departments.map(dept => ({
      name: dept.name,
      hasManager: !!dept.getManager(),
      managerName: dept.getManager()?.name || '暂无经理',
      managerEmail: dept.getManagerEmail() || '暂无邮箱'
    }));
  }
}

// 使用外观模式
const companyFacade = new CompanyInfoFacade(company);
const engineeringManager = companyFacade.getManagerInfo('Engineering');
console.log('工程部经理信息:', engineeringManager);

const departmentsSummary = companyFacade.getDepartmentsSummary();
console.log('部门摘要:', departmentsSummary);
```

## 课后练习

1. **消息链识别**：找出你项目中的过长的消息链
2. **隐藏委托**：为消息链创建委托方法
3. **提取查询**：将复杂的消息链提取为查询方法
4. **外观模式**：使用外观模式简化复杂调用

**练习代码**：
```javascript
// 重构以下代码，解决过长的消息链问题
function getUserProfile(userId) {
  // 过长的消息链
  const user = database.getUser(userId);
  const profile = user.getProfile();
  const settings = profile.getSettings();
  const preferences = settings.getPreferences();
  const theme = preferences.getTheme();
  const language = preferences.getLanguage();
  
  return {
    userId: userId,
    theme: theme,
    language: language,
    // 更多属性...
  };
}