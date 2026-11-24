# Backend Contract v0.1.0

这是消费者项目使用的正式规范入口。研究候选、来源和历史案例分别保留在仓库根目录的 draft/、references/、real-cases/；它们不是额外的强制规则集合。

## 从哪里开始

- Agent 开发入口：[AGENT.md](./AGENT.md)
- 架构与模块边界：[ARCHITECTURE.md](./ARCHITECTURE.md)
- 数据、身份与持久化：[DATA.md](./DATA.md)
- API 与 HTTP：[API.md](./API.md)
- 安全：[SECURITY.md](./SECURITY.md)
- 可靠性、发布与恢复：[RELIABILITY.md](./RELIABILITY.md)
- 可观测性：[OBSERVABILITY.md](./OBSERVABILITY.md)
- 三种保障方式与规则映射：[GATES.md](./GATES.md)
- Review 证据采集：[REVIEW.md](./REVIEW.md)
- 交付验收：[ACCEPTANCE.md](./ACCEPTANCE.md)
- 消费者 manifest：[manifest.schema.json](./manifest.schema.json)

## 适用方式

Contract 是跨项目默认原则，不是框架，也不替代消费者项目的 Owner。项目必须根据真实语言、数据库、平台、消费者和业务不变量选择实现方式。不适用时说明理由，不得机械套用技术栈专属规则。

## 三种保障方式

| 方式 | 主要阶段 | 责任 |
|---|---|---|
| Gate | 提交、CI、迁移、发布 | 机器检查确定性不变量 |
| Agent | 设计、编码、修改 | 开发过程中遵循规范并做取舍 |
| Review | 完成后、发布后、周期巡检 | 基于真实证据审查语义和整体结果 |

同一原则可以同时由 Gate、Agent 和 Review 保障。不是每条原则都适合 Gate；不能确定性判断的内容不得伪装成硬门禁。

## 版本

当前版本：**0.1.0**。这是第一个可接入版本，包含规范、Agent 入口、通用 CLI 和消费者接入流程。它不代表所有候选实践已经自动化，也不代表任何消费者项目已经通过验收。
