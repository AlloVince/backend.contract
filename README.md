# Backend Contract

跨语言、跨数据库、跨部署平台的后端工程契约。它把已经验证的工程经验落实为三种互补保障：机器 Gate、开发过程中的 Agent 约束，以及基于真实证据的 Review。

它不是后端框架，不强制统一技术栈，也不要求所有规则都变成 CI 门禁。

## 快速使用

要求 Node.js 22.16 或更高版本（低于 27）。

~~~bash
# 创建语言无关的新项目骨架（目标目录必须为空）
node bin/contract.mjs create ~/Developer/new.backend

# 给现有项目增量接入，不覆盖业务代码
node bin/contract.mjs adopt ~/Developer/existing.backend

# 检查契约接入状态；默认不执行项目命令
node bin/contract.mjs check ~/Developer/existing.backend

# 执行项目在 backend-contract.json 中明确配置的检查
node bin/contract.mjs check ~/Developer/existing.backend --run

# 严格检查：缺少或未运行必需检查时返回失败
node bin/contract.mjs check ~/Developer/new.backend --run --strict

# 采集项目结构、测试、API Schema、迁移、CI 和部署证据（输出到终端）
node bin/contract.mjs review ~/Developer/existing.backend

# 需要保存时，显式指定项目内的报告路径
node bin/contract.mjs review ~/Developer/existing.backend --out=review/backend-review.md

# 更新未被项目本地修改的 Contract 副本
node bin/contract.mjs update ~/Developer/existing.backend
~~~

## 三种保障方式

| 方式 | 做什么 | 典型内容 |
|---|---|---|
| Gate | 机器可确定性判断 | 静态分析、OpenAPI、Secret Scanner、权限测试、唯一约束、迁移、分页、幂等和 CI |
| Agent | 开发过程中持续遵循 | 模块边界、数据 Owner、领域 API、复杂度取舍、事务与恢复设计 |
| Review | 依赖真实证据判断 | 业务语义、N+1、资源成本、真实用户路径、发布和恢复 |

一条原则可以同时由三种方式保障。缺少确定性判断条件时，不把它强行变成门禁。

## 重要行为边界

- create 只生成通用目录和契约，不生成伪装成可运行的特定技术栈后端。
- adopt 使用 incremental 模式，保留现有业务代码、README 和 AGENTS 内容。
- check 默认只检查接入结构，不执行任意项目命令。
- 只有 backend-contract.json 的 checks 数组中明确配置的命令，才会被 check --run 执行；命令以参数数组运行，不经过 shell。
- strict 模式要求必需检查已配置并实际运行。未运行不等于通过。
- review 默认只向终端输出事实，不写入项目文件；只有显式指定 --out=... 才保存报告，且输出路径必须在项目内部。它不自动判定架构合规，不运行测试或部署。
- update 只覆盖与上次安装内容一致的文件；消费者本地修改会保留并报告。
- Contract 版本用于追溯，不是运行锁、审批或冻结机制。

## 目录

- owner/PROJECT.md：项目最高意图。
- plan/PRODUCTIZATION.md：产品结构和实施计划。
- contract/：正式规范。
- bin/contract.mjs：CLI。
- templates/generic-service/：语言无关的工程起点。
- contract/manifest.schema.json：消费者 manifest 的 JSON Schema，并随契约一起安装。
- tests/：CLI 行为回归测试。
- draft/：候选规则与适用性评估。
- references/：外部工程实践。
- real-cases/：真实反例与经验来源。

## 研究资产如何进入正式 Contract

1. 先核实真实案例与当前实现。
2. 对照 references，评估候选实践的收益、适用范围和副作用。
3. 在 draft 中明确采用、修改后采用、按需采用或不采用及理由。
4. 只有稳定且适用于跨项目的结论才进入 contract/。
5. 通过真实实现、自动检查和端到端行为验收；不把文档存在当成落地完成。

draft/ 与 references/ 不自动生效；real-cases/ 提供可追溯的经验来源。不要因为某条行业最佳实践存在，就默认每个项目都必须采用。

## 当前状态

**v0.1.0 — 首个可接入版本。** 已提供正式规范、Agent 入口、通用模板和 create/adopt/check/review/update 命令。Golf Importer 已完成一次真实增量接入与现有 CI 检查实跑；Butler 因当前工作区有未提交的 Dashboard / Task 状态改动，暂不叠加接入。尚未宣称所有 29 组核心规则都已自动化。
