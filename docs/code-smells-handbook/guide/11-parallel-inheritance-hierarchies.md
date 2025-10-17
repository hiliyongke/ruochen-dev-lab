# 11. 平行继承体系 (Parallel Inheritance Hierarchies)

平行继承体系是指每当为某个类添加子类时，也必须为另一个类添加子类。

## 问题定义

当两个或多个类的继承层次结构相互依赖，每当为一个类添加子类时，也必须为其他相关的类添加相应的子类时，就出现了平行继承体系的坏味道。这表明类之间的耦合度过高。

## 典型症状

1. **同步添加**：添加一个子类需要同步添加其他子类
2. **命名对应**：子类名称有明显的对应关系
3. **功能耦合**：相关功能被分散在多个类中
4. **维护困难**：修改一个层次需要修改其他层次
5. **重复代码**：相似的逻辑出现在多个地方

## 重构方法

### 1. 搬移方法 (Move Method)
将方法移动到更合适的类中。

### 2. 搬移字段 (Move Field)
将字段移动到更合适的类中。

### 3. 提取超类 (Extract Superclass)
提取公共的超类来消除重复。

### 4. 用委托替代继承 (Replace Inheritance with Delegation)
用委托关系替代继承关系。

### 5. 用组合替代继承 (Replace Inheritance with Composition)
用组合关系替代继承关系。

## 实际案例

### 重构前代码

```javascript
// 平行继承体系的典型例子 - 图形编辑器和工具

// 图形类层次结构
class Shape {
  constructor(name) {
    this.name = name;
  }
  
  draw() {
    console.log(`绘制${this.name}`);
  }
  
  // 每个图形都需要对应的工具
  getTool() {
    throw new Error('子类必须实现getTool方法');
  }
}

class Circle extends Shape {
  constructor(radius) {
    super('圆形');
    this.radius = radius;
  }
  
  getTool() {
    return new CircleTool();  // 必须返回对应的工具
  }
  
  calculateArea() {
    return Math.PI * this.radius * this.radius;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super('矩形');
    this.width = width;
    this.height = height;
  }
  
  getTool() {
    return new RectangleTool();  // 必须返回对应的工具
  }
  
  calculateArea() {
    return this.width * this.height;
  }
}

class Triangle extends Shape {
  constructor(base, height) {
    super('三角形');
    this.base = base;
    this.height = height;
  }
  
  getTool() {
    return new TriangleTool();  // 必须返回对应的工具
  }
  
  calculateArea() {
    return (this.base * this.height) / 2;
  }
}

// 工具类层次结构 - 与图形类平行
class Tool {
  constructor(name) {
    this.name = name;
  }
  
  // 每个工具都需要对应的图形创建方法
  createShape() {
    throw new Error('子类必须实现createShape方法');
  }
  
  // 工具操作
  select() {
    console.log(`选择${this.name}工具`);
  }
  
  use() {
    console.log(`使用${this.name}工具`);
  }
}

class CircleTool extends Tool {
  constructor() {
    super('圆形工具');
  }
  
  createShape(radius = 10) {
    return new Circle(radius);  // 必须创建对应的图形
  }
  
  // 圆形特有的工具功能
  drawCircle() {
    console.log('绘制圆形');
  }
}

class RectangleTool extends Tool {
  constructor() {
    super('矩形工具');
  }
  
  createShape(width = 20, height = 10) {
    return new Rectangle(width, height);  // 必须创建对应的图形
  }
  
  // 矩形特有的工具功能
  drawRectangle() {
    console.log('绘制矩形');
  }
}

class TriangleTool extends Tool {
  constructor() {
    super('三角形工具');
  }
  
  createShape(base = 15, height = 10) {
    return new Triangle(base, height);  // 必须创建对应的图形
  }
  
  // 三角形特有的工具功能
  drawTriangle() {
    console.log('绘制三角形');
  }
}

// 使用示例 - 添加新图形需要同步添加新工具
const circle = new Circle(5);
const circleTool = circle.getTool();
circleTool.select();
circle.draw();

const rectangle = new Rectangle(10, 5);
const rectangleTool = rectangle.getTool();
rectangleTool.select();
rectangle.draw();

// 问题：添加新图形（如椭圆）需要同步添加椭圆工具
class Ellipse extends Shape {
  constructor(majorAxis, minorAxis) {
    super('椭圆');
    this.majorAxis = majorAxis;
    this.minorAxis = minorAxis;
  }
  
  getTool() {
    return new EllipseTool();  // 必须添加对应的工具类
  }
  
  calculateArea() {
    return Math.PI * this.majorAxis * this.minorAxis;
  }
}

class EllipseTool extends Tool {
  constructor() {
    super('椭圆工具');
  }
  
  createShape(majorAxis = 10, minorAxis = 5) {
    return new Ellipse(majorAxis, minorAxis);
  }
  
  drawEllipse() {
    console.log('绘制椭圆');
  }
}
```

### 重构后代码

```javascript
// 使用组合和策略模式重构平行继承体系

// 图形接口
class Shape {
  constructor(name) {
    this.name = name;
  }
  
  draw() {
    console.log(`绘制${this.name}`);
  }
  
  calculateArea() {
    throw new Error('子类必须实现calculateArea方法');
  }
  
  // 不再需要返回对应的工具
}

// 具体的图形实现
class Circle extends Shape {
  constructor(radius) {
    super('圆形');
    this.radius = radius;
  }
  
  calculateArea() {
    return Math.PI * this.radius * this.radius;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super('矩形');
    this.width = width;
    this.height = height;
  }
  
  calculateArea() {
    return this.width * this.height;
  }
}

class Triangle extends Shape {
  constructor(base, height) {
    super('三角形');
    this.base = base;
    this.height = height;
  }
  
  calculateArea() {
    return (this.base * this.height) / 2;
  }
}

// 工具接口 - 不再与特定图形绑定
class Tool {
  constructor(name) {
    this.name = name;
  }
  
  select() {
    console.log(`选择${this.name}`);
  }
  
  use() {
    console.log(`使用${this.name}`);
  }
  
  // 通用的图形创建方法
  createShape(shapeType, ...args) {
    return ShapeFactory.createShape(shapeType, ...args);
  }
}

// 具体的工具实现 - 基于功能而不是图形类型
class SelectionTool extends Tool {
  constructor() {
    super('选择工具');
  }
  
  use() {
    console.log('选择图形对象');
  }
}

class DrawingTool extends Tool {
  constructor() {
    super('绘图工具');
  }
  
  use() {
    console.log('绘制基本图形');
  }
  
  // 可以绘制多种图形
  drawCircle(radius) {
    console.log(`绘制半径为${radius}的圆形`);
    return new Circle(radius);
  }
  
  drawRectangle(width, height) {
    console.log(`绘制${width}x${height}的矩形`);
    return new Rectangle(width, height);
  }
  
  drawTriangle(base, height) {
    console.log(`绘制底${base}高${height}的三角形`);
    return new Triangle(base, height);
  }
}

class EditingTool extends Tool {
  constructor() {
    super('编辑工具');
  }
  
  use() {
    console.log('编辑图形属性');
  }
  
  // 编辑功能不依赖于特定图形类型
  resizeShape(shape, factor) {
    console.log(`将图形放大${factor}倍`);
    // 通用的调整大小逻辑
  }
  
  rotateShape(shape, degrees) {
    console.log(`将图形旋转${degrees}度`);
    // 通用的旋转逻辑
  }
}

// 图形工厂 - 负责创建图形对象
class ShapeFactory {
  static createShape(shapeType, ...args) {
    const shapeCreators = {
      'circle': (radius) => new Circle(radius),
      'rectangle': (width, height) => new Rectangle(width, height),
      'triangle': (base, height) => new Triangle(base, height),
      'ellipse': (majorAxis, minorAxis) => new Ellipse(majorAxis, minorAxis)
    };
    
    const creator = shapeCreators[shapeType];
    if (!creator) {
      throw new Error(`不支持的图形类型: ${shapeType}`);
    }
    
    return creator(...args);
  }
  
  static getAvailableShapes() {
    return Object.keys(this.shapeCreators);
  }
}

// 新图形添加 - 不再需要同步添加工具
class Ellipse extends Shape {
  constructor(majorAxis, minorAxis) {
    super('椭圆');
    this.majorAxis = majorAxis;
    this.minorAxis = minorAxis;
  }
  
  calculateArea() {
    return Math.PI * this.majorAxis * this.minorAxis;
  }
}

// 使用示例 - 不再需要平行继承
const drawingTool = new DrawingTool();
drawingTool.select();

// 使用同一个工具创建不同图形
const circle = drawingTool.drawCircle(5);
const rectangle = drawingTool.drawRectangle(10, 5);
const triangle = drawingTool.drawTriangle(8, 6);

circle.draw();
rectangle.draw();
triangle.draw();

// 添加新图形只需要扩展工厂，不需要修改工具
const ellipse = ShapeFactory.createShape('ellipse', 10, 5);
ellipse.draw();

// 编辑工具可以处理任何图形
const editingTool = new EditingTool();
editingTool.resizeShape(circle, 1.5);
editingTool.rotateShape(rectangle, 45);
```

## 课后练习

1. **平行继承识别**：找出你项目中的平行继承体系
2. **组合重构**：用组合关系替代继承关系
3. **工厂模式**：使用工厂模式来创建对象
4. **接口分离**：设计清晰的接口来减少耦合

**练习代码**：
```javascript
// 重构以下代码，解决平行继承体系问题
class Vehicle {
  constructor(type) {
    this.type = type;
  }
  
  getEngine() {
    throw new Error('子类必须实现getEngine方法');
  }
}

class Car extends Vehicle {
  constructor() {
    super('汽车');
  }
  
  getEngine() {
    return new CarEngine();  // 必须返回对应的引擎
  }
}

class Truck extends Vehicle {
  constructor() {
    super('卡车');
  }
  
  getEngine() {
    return new TruckEngine();  // 必须返回对应的引擎
  }
}

class Engine {
  constructor(type) {
    this.type = type;
  }
  
  getVehicle() {
    throw new Error('子类必须实现getVehicle方法');
  }
}

class CarEngine extends Engine {
  constructor() {
    super('汽车引擎');
  }
  
  getVehicle() {
    return new Car();  // 必须返回对应的车辆
  }
}

class TruckEngine extends Engine {
  constructor() {
    super('卡车引擎');
  }
  
  getVehicle() {
    return new Truck();  // 必须返回对应的车辆
  }
}