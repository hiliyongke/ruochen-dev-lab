# 附录：速查表与规范模板

常用命令：
- Vitest UI：npm run test
- 一次性跑并出覆盖率：npm run test:run
- 只跑某个文件：vitest src/foo.test.ts
- 只跑匹配名称：vitest -t "should do something"

断言速查：
- 值相等：toBe/toEqual
- 异步：await expect(p).resolves/rejects
- DOM：toBeInTheDocument/toHaveTextContent
- 调用：toHaveBeenCalledWith/toHaveBeenCalledTimes

Mock 速查：
- 函数：vi.fn().mockReturnValue(...)
- 模块：vi.spyOn(obj, "method")
- 计时器：vi.useFakeTimers()/advanceTimersByTime

PR 流程模板：
- 变更说明
- 涉及风险模块
- 关联用例列表
- 覆盖率变化（前/后）
- 自测清单通过

覆盖率建议阈值（起步）：
- 语句/函数 70%，分支 60%，关键模块单独 80%+