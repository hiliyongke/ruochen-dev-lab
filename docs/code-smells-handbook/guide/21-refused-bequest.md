# 21. 被拒绝的遗赠 (Refused Bequest)

被拒绝的遗赠是指子类继承了父类的数据和方法，但只使用了其中一部分，拒绝使用其他部分。

## 问题定义

当子类继承了父类的功能，但只使用了其中一部分，或者需要重写父类方法来实现不同的行为时，就出现了被拒绝的遗赠坏味道。这表明继承关系可能不合适。

## 典型症状

1. **部分继承**：子类只使用部分父类功能
2. **方法重写**：需要重写父类方法
3. **接口不匹配**：子类接口与父类不匹配
4. **继承滥用**：为了复用而使用继承
5. **设计不当**：继承关系不符合"is-a"关系

## 重构方法

### 1. 用委托替代继承 (Replace Inheritance with Delegation)
使用委托关系替代继承关系。

### 2. 提取子类 (Extract Subclass)
将不同的行为提取到独立的子类中。

### 3. 用组合替代继承 (Replace Inheritance with Composition)
使用组合关系实现功能复用。

### 4. 提取接口 (Extract Interface)
定义清晰的接口契约。

### 5. 用策略模式替代继承 (Replace Inheritance with Strategy)
用策略模式处理不同的行为。

## 实际案例

### 重构前代码

```javascript
// 被拒绝的遗赠典型例子

// 父类 - 交通工具
class Vehicle {
  constructor(make, model, year, fuelType) {
    this.make = make;
    this.model = model;
    this.year = year;
    this.fuelType = fuelType;
  }
  
  // 通用方法
  start() {
    console.log(`${this.make} ${this.model} 启动`);
  }
  
  stop() {
    console.log(`${this.make} ${this.model} 停止`);
  }
  
  // 陆地交通工具方法
  accelerate() {
    console.log(`${this.make} ${this.model} 加速`);
  }
  
  brake() {
    console.log(`${this.make} ${this.model} 刹车`);
  }
  
  // 水上交通工具方法
  anchor() {
    console.log(`${this.make} ${this.model} 抛锚`);
  }
  
  // 空中交通工具方法
  takeOff() {
    console.log(`${this.make} ${this.model} 起飞`);
  }
  
  land() {
    console.log(`${this.make} ${this.model} 降落`);
  }
  
  // 通用信息
  getInfo() {
    return `${this.year} ${this.make} ${this.model} (${this.fuelType})`;
  }
}

// 子类 - 汽车（拒绝使用水上和空中方法）
class Car extends Vehicle {
  constructor(make, model, year, fuelType, doors) {
    super(make, model, year, fuelType);
    this.doors = doors;
  }
  
  // 只使用陆地交通工具方法，拒绝其他方法
  // 水上和空中方法完全用不到，但被迫继承
  
  // 需要重写父类方法
  getInfo() {
    return `${super.getInfo()} - ${this.doors}门汽车`;
  }
  
  // 汽车特有方法
  honk() {
    console.log(`${this.make} ${this.model} 鸣笛`);
  }
}

// 子类 - 船（拒绝使用陆地和空中方法）
class Boat extends Vehicle {
  constructor(make, model, year, fuelType, length) {
    super(make, model, year, fuelType);
    this.length = length;
  }
  
  // 只使用水上交通工具方法，拒绝其他方法
  // 陆地和空中方法完全用不到
  
  // 需要重写父类方法
  getInfo() {
    return `${super.getInfo()} - ${this.length}英尺船只`;
  }
  
  // 船特有方法
  dropAnchor() {
    this.anchor(); // 使用父类方法
  }
}

// 子类 - 飞机（拒绝使用陆地和水上方法）
class Airplane extends Vehicle {
  constructor(make, model, year, fuelType, wingspan) {
    super(make, model, year, fuelType);
    this.wingspan = wingspan;
  }
  
  // 只使用空中交通工具方法，拒绝其他方法
  // 陆地和水上方法完全用不到
  
  // 需要重写父类方法
  getInfo() {
    return `${super.getInfo()} - ${this.wingspan}英尺翼展`;
  }
  
  // 飞机特有方法
  deployLandingGear() {
    console.log(`${this.make} ${this.model} 放下起落架`);
  }
}

// 使用示例 - 继承关系混乱
const car = new Car('Toyota', 'Camry', 2023, 'gasoline', 4);
const boat = new Boat('Yamaha', '242X', 2023, 'gasoline', 24);
const airplane = new Airplane('Boeing', '737', 2023, 'jet', 118);

console.log(car.getInfo());
car.start();
car.accelerate();
car.honk();
car.brake();
car.stop();

// 问题：汽车对象有不需要的方法
console.log('汽车可以抛锚吗？', typeof car.anchor); // 不需要的方法
console.log('汽车可以起飞吗？', typeof car.takeOff); // 不需要的方法

console.log(boat.getInfo());
boat.start();
boat.anchor();
boat.stop();

console.log(airplane.getInfo());
airplane.start();
airplane.takeOff();
airplane.land();
airplane.stop();

// 另一个例子 - 员工继承体系
class Employee {
  constructor(name, salary, department) {
    this.name = name;
    this.salary = salary;
    this.department = department;
  }
  
  // 通用员工方法
  work() {
    console.log(`${this.name} 正在工作`);
  }
  
  takeBreak() {
    console.log(`${this.name} 正在休息`);
  }
  
  // 管理者方法
  manageTeam() {
    console.log(`${this.name} 正在管理团队`);
  }
  
  // 开发者方法
  writeCode() {
    console.log(`${this.name} 正在写代码`);
  }
  
  // 销售方法
  makeSale() {
    console.log(`${this.name} 正在销售`);
  }
  
  // 通用信息
  getInfo() {
    return `${this.name} - ${this.department} - 薪资: $${this.salary}`;
  }
}

// 开发者类（拒绝使用管理和销售方法）
class Developer extends Employee {
  constructor(name, salary, programmingLanguage) {
    super(name, salary, 'IT');
    this.programmingLanguage = programmingLanguage;
  }
  
  // 只使用开发者方法，拒绝其他方法
  // 管理和销售方法用不到
  
  getInfo() {
    return `${super.getInfo()} - 语言: ${this.programmingLanguage}`;
  }
  
  debug() {
    console.log(`${this.name} 正在调试代码`);
  }
}

// 销售类（拒绝使用管理和开发方法）
class Salesperson extends Employee {
  constructor(name, salary, commissionRate) {
    super(name, salary, 'Sales');
    this.commissionRate = commissionRate;
  }
  
  // 只使用销售方法，拒绝其他方法
  // 管理和开发方法用不到
  
  getInfo() {
    return `${super.getInfo()} - 佣金率: ${this.commissionRate * 100}%`;
  }
  
  calculateCommission(saleAmount) {
    return saleAmount * this.commissionRate;
  }
}

// 使用示例
const dev = new Developer('张三', 80000, 'JavaScript');
const sales = new Salesperson('李四', 60000, 0.1);

console.log(dev.getInfo());
dev.work();
dev.writeCode();
dev.debug();
dev.takeBreak();

console.log(sales.getInfo());
sales.work();
sales.makeSale();
const commission = sales.calculateCommission(10000);
console.log('佣金:', commission);

// 问题：开发者有不需要的管理方法
console.log('开发者可以管理团队吗？', typeof dev.manageTeam); // 不需要的方法
```

### 重构后代码

```javascript
// 重构后的代码 - 使用组合和接口替代继承

// 1. 使用接口和组合替代继承

// 定义清晰的接口
class Engine {
  start() {
    console.log('引擎启动');
  }
  
  stop() {
    console.log('引擎停止');
  }
}

// 陆地交通工具接口
class LandVehicle {
  constructor(engine) {
    this.engine = engine;
  }
  
  start() {
    this.engine.start();
  }
  
  stop() {
    this.engine.stop();
  }
  
  accelerate() {
    console.log('加速');
  }
  
  brake() {
    console.log('刹车');
  }
}

// 水上交通工具接口
class WaterVehicle {
  constructor(engine) {
    this.engine = engine;
  }
  
  start() {
    this.engine.start();
  }
  
  stop() {
    this.engine.stop();
  }
  
  anchor() {
    console.log('抛锚');
  }
}

// 空中交通工具接口
class AirVehicle {
  constructor(engine) {
    this.engine = engine;
  }
  
  start() {
    this.engine.start();
  }
  
  stop() {
    this.engine.stop();
  }
  
  takeOff() {
    console.log('起飞');
  }
  
  land() {
    console.log('降落');
  }
}

// 具体的交通工具类
class Car {
  constructor(make, model, year, fuelType, doors) {
    this.make = make;
    this.model = model;
    this.year = year;
    this.fuelType = fuelType;
    this.doors = doors;
    
    // 使用组合而非继承
    this.engine = new Engine();
    this.landVehicle = new LandVehicle(this.engine);
  }
  
  // 只实现需要的方法
  start() {
    this.landVehicle.start();
    console.log(`${this.make} ${this.model} 启动`);
  }
  
  stop() {
    this.landVehicle.stop();
    console.log(`${this.make} ${this.model} 停止`);
  }
  
  accelerate() {
    this.landVehicle.accelerate();
  }
  
  brake() {
    this.landVehicle.brake();
  }
  
  // 汽车特有方法
  honk() {
    console.log(`${this.make} ${this.model} 鸣笛`);
  }
  
  getInfo() {
    return `${this.year} ${this.make} ${this.model} (${this.fuelType}) - ${this.doors}门汽车`;
  }
}

class Boat {
  constructor(make, model, year, fuelType, length) {
    this.make = make;
    this.model = model;
    this.year = year;
    this.fuelType = fuelType;
    this.length = length;
    
    this.engine = new Engine();
    this.waterVehicle = new WaterVehicle(this.engine);
  }
  
  start() {
    this.waterVehicle.start();
    console.log(`${this.make} ${this.model} 启动`);
  }
  
  stop() {
    this.waterVehicle.stop();
    console.log(`${this.make} ${this.model} 停止`);
  }
  
  anchor() {
    this.waterVehicle.anchor();
  }
  
  dropAnchor() {
    this.anchor();
  }
  
  getInfo() {
    return `${this.year} ${this.make} ${this.model} (${this.fuelType}) - ${this.length}英尺船只`;
  }
}

class Airplane {
  constructor(make, model, year, fuelType, wingspan) {
    this.make = make;
    this.model = model;
    this.year = year;
    this.fuelType = fuelType;
    this.wingspan = wingspan;
    
    this.engine = new Engine();
    this.airVehicle = new AirVehicle(this.engine);
  }
  
  start() {
    this.airVehicle.start();
    console.log(`${this.make} ${this.model} 启动`);
  }
  
  stop() {
    this.airVehicle.stop();
    console.log(`${this.make} ${this.model} 停止`);
  }
  
  takeOff() {
    this.airVehicle.takeOff();
  }
  
  land() {
    this.airVehicle.land();
  }
  
  deployLandingGear() {
    console.log(`${this.make} ${this.model} 放下起落架`);
  }
  
  getInfo() {
    return `${this.year} ${this.make} ${this.model} (${this.fuelType}) - ${this.wingspan}英尺翼展`;
  }
}

// 使用示例 - 清晰的职责分离
const car = new Car('Toyota', 'Camry', 2023, 'gasoline', 4);
const boat = new Boat('Yamaha', '242X', 2023, 'gasoline', 24);
const airplane = new Airplane('Boeing', '737', 2023, 'jet', 118);

console.log(car.getInfo());
car.start();
car.accelerate();
car.honk();
car.brake();
car.stop();

console.log(boat.getInfo());
boat.start();
boat.anchor();
boat.stop();

console.log(airplane.getInfo());
airplane.start();
airplane.takeOff();
airplane.land();
airplane.stop();

// 2. 使用策略模式处理员工体系

// 工作行为接口
class WorkBehavior {
  work() {
    throw new Error('必须实现work方法');
  }
}

class DevelopmentWork extends WorkBehavior {
  work() {
    console.log('正在写代码');
  }
  
  debug() {
    console.log('正在调试代码');
  }
}

class SalesWork extends WorkBehavior {
  work() {
    console.log('正在销售');
  }
  
  makeSale() {
    console.log('完成一笔销售');
  }
}

class ManagementWork extends WorkBehavior {
  work() {
    console.log('正在管理团队');
  }
  
  manageTeam() {
    console.log('管理团队');
  }
}

// 员工基类
class Employee {
  constructor(name, salary, department, workBehavior) {
    this.name = name;
    this.salary = salary;
    this.department = department;
    this.workBehavior = workBehavior;
  }
  
  // 通用方法
  work() {
    this.workBehavior.work();
  }
  
  takeBreak() {
    console.log(`${this.name} 正在休息`);
  }
  
  getInfo() {
    return `${this.name} - ${this.department} - 薪资: $${this.salary}`;
  }
  
  // 可以动态改变工作行为
  setWorkBehavior(workBehavior) {
    this.workBehavior = workBehavior;
  }
}

// 具体的员工类
class Developer extends Employee {
  constructor(name, salary, programmingLanguage) {
    super(name, salary, 'IT', new DevelopmentWork());
    this.programmingLanguage = programmingLanguage;
  }
  
  work() {
    console.log(`${this.name} 正在使用${this.programmingLanguage}编程`);
    this.workBehavior.work();
  }
  
  debug() {
    this.workBehavior.debug();
  }
  
  getInfo() {
    return `${super.getInfo()} - 语言: ${this.programmingLanguage}`;
  }
}

class Salesperson extends Employee {
  constructor(name, salary, commissionRate) {
    super(name, salary, 'Sales', new SalesWork());
    this.commissionRate = commissionRate;
  }
  
  work() {
    console.log(`${this.name} 正在销售`);
    this.workBehavior.work();
  }
  
  calculateCommission(saleAmount) {
    return saleAmount * this.commissionRate;
  }
  
  getInfo() {
    return `${super.getInfo()} - 佣金率: ${this.commissionRate * 100}%`;
  }
}

class Manager extends Employee {
  constructor(name, salary, teamSize) {
    super(name, salary, 'Management', new ManagementWork());
    this.teamSize = teamSize;
  }
  
  work() {
    console.log(`${this.name} 正在管理${this.teamSize}人团队`);
    this.workBehavior.work();
  }
  
  getInfo() {
    return `${super.getInfo()} - 团队规模: ${this.teamSize}人`;
  }
}

// 使用示例 - 清晰的职责分离
const dev = new Developer('张三', 80000, 'JavaScript');
const sales = new Salesperson('李四', 60000, 0.1);
const manager = new Manager('王五', 100000, 10);

console.log(dev.getInfo());
dev.work();
dev.debug();
dev.takeBreak();

console.log(sales.getInfo());
sales.work();
const commission = sales.calculateCommission(10000);
console.log('佣金:', commission);

console.log(manager.getInfo());
manager.work();

// 3. 使用提取子类处理不同的行为

// 支付处理基类
class PaymentProcessor {
  process(amount) {
    this.validate(amount);
    const processedAmount = this.calculateAmount(amount);
    return this.execute(processedAmount);
  }
  
  validate(amount) {
    if (amount <= 0) {
      throw new Error('金额必须大于0');
    }
  }
  
  calculateAmount(amount) {
    return amount; // 默认不计算
  }
  
  execute(amount) {
    throw new Error('必须实现execute方法');
  }
}

// 具体的支付处理器
class CreditCardProcessor extends PaymentProcessor {
  calculateAmount(amount) {
    // 信用卡手续费
    return amount * 1.03;
  }
  
  execute(amount) {
    console.log(`使用信用卡支付: $${amount}`);
    return { success: true, amount: amount };
  }
}

class PayPalProcessor extends PaymentProcessor {
  calculateAmount(amount) {
    // PayPal手续费
    return amount * 1.05;
  }
  
  execute(amount) {
    console.log(`使用PayPal支付: $${amount}`);
    return { success: true, amount: amount };
  }
}

class BankTransferProcessor extends PaymentProcessor {
  execute(amount) {
    console.log(`使用银行转账支付: $${amount}`);
    return { success: true, amount: amount };
  }
}

// 使用示例
const creditCard = new CreditCardProcessor();
const paypal = new PayPalProcessor();
const bankTransfer = new BankTransferProcessor();

console.log(creditCard.process(100));
console.log(paypal.process(100));
console.log(bankTransfer.process(100));
```

## 课后练习

1. **识别遗赠拒绝**：找出项目中被拒绝的遗赠
2. **重构继承关系**：用组合替代不合适的继承
3. **接口设计**：设计清晰的接口契约
4. **策略模式应用**：用策略模式处理不同的行为

**练习代码**：
```javascript
// 重构以下继承关系
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  eat() { console.log('吃东西') }
  sleep() { console.log('睡觉') }
  fly() { console.log('飞行') }  // 鸟类方法
  swim() { console.log('游泳') } // 鱼类方法
}

class Dog extends Animal {
  // 拒绝使用fly和swim方法
}

class Bird extends Animal {
  // 拒绝使用swim方法
}