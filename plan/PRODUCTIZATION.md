# Backend Contract 产品化计划

## 当前实施状态（2026-11-25）

- [x] 建立 Owner、正式规范和 Gate / Agent / Review 映射。
- [x] 正式引入八项 Design Review：设计前自检及按需复查入口，不依赖消费者安装；消除既有专题规范与用户确认原则的冲突。
- [x] 提供无外部依赖的 CLI、通用模板和 manifest JSON Schema。
- [x] 实现 create / adopt / check / review / update，并为文件保护、显式命令执行和路径边界编写回归测试。
- [x] Golf Importer 增量接入：保留原 AGENTS/Owner，记录项目基线，复用现有 CI 命令；Ruff、35 项架构测试、334 项测试与 Worker dry-run 已实跑通过，check --run --strict 全绿。
- [x] Backend Contract 自身 11 项 CLI 回归测试通过；覆盖 create/adopt/check/review/update、显式命令执行、文件保护和路径安全。
- [ ] Butler 暂缓接入：当前工作区有大量未提交的 Dashboard / Task 状态改动，避免在活动工作区叠加接入变更；待工作区收敛后再核对 Owner 与真实门禁。
- [ ] 根据 Butler 和其他真实消费者反馈修订规范并完成独立验收。

## 当前目标

将已有的 229 条候选实践、29 组核心规则和真实案例，转化为可被消费者项目实际使用的契约、Agent 入口、CLI 与测试范例。

## 产品结构

- owner/PROJECT.md：项目最高意图与权威边界。
- contract/：对消费者生效的正式规范。
- bin/contract.mjs：创建、接入、检查、证据采集和安全更新。
- templates/generic-service/：不绑定语言或框架的最小工程骨架。
- contract/manifest.schema.json：消费者 manifest 的 JSON Schema，并随契约一起安装。
- tests/：CLI 行为回归。
- draft/：候选规则与适用性评估。
- references/：外部工程资料。
- real-cases/：真实反例与经验来源。

## 三种保障方式

### Gate

只对可确定性判断的规则启用机器检查。优先复用项目已有的 linter、类型检查、测试、OpenAPI 工具、Secret Scanner、CI 和数据库能力。项目专属业务不变量由消费者项目提供测试。

### Agent

在设计和编码时读取相关规范。重点约束模块与数据所有权、API 领域语义、事务与幂等、外部调用、资源路径和复杂度取舍。按需读取，不要求每次加载全部文档。

### Review

CLI 负责采集项目结构、测试、迁移、API Schema、CI、部署配置等事实；Agent 结合 Owner、真实消费者和运行证据进行判断。Review 不是自动生成“合规通过”结论。

## CLI 行为

~~~bash
node bin/contract.mjs create <empty-project-path>
node bin/contract.mjs adopt <existing-project-path>
node bin/contract.mjs check <project-path>
node bin/contract.mjs check <project-path> --run
node bin/contract.mjs check <project-path> --strict
node bin/contract.mjs review <project-path>
node bin/contract.mjs update <project-path>
~~~

- create：建立通用工程骨架，默认 strict；不伪造某个语言或框架的可运行服务。
- adopt：给现有项目增量接入，默认 incremental；不重写现有业务代码。
- check：检查接入完整性、契约快照和已配置的检查；默认不执行项目命令。
- check --run：只执行消费者在 manifest 中明确配置的命令数组，不执行自动猜测的命令。
- check --strict：未配置或未运行必需检查时返回失败；incremental 项目默认只报告未验证，不冒充通过。
- review：默认向终端输出只读工程证据；显式 --out=... 才保存报告，不自动宣称架构合规。
- update：只更新未被消费者修改的契约副本；本地修改保留并报告冲突。

## 实施阶段

1. 建立 Owner、正式规范和三种保障方式的映射。
2. 提供无外部依赖的 CLI、通用模板和自动化测试。
3. 验证 create/adopt/check/review/update 的真实行为与文件保护。
4. 先在 Golf Importer 和 Butler 做消费者试接入，复用其已有门禁，验证语言无关性和误报边界。
5. 根据真实接入反馈修订规范，形成第一个可发布版本。

## 不作为当前完成条件的事项

- 不要求本轮把所有 29 组规则都写成自动检查。
- 不在 Backend Contract 内实现各语言的 lint、测试框架或数据库检测器。
- 不为 Golf 现有的已知缺口直接修改 Golf 业务代码；消费者接入和业务修复是独立工作。
- 不把通用模板包装成可直接部署的生产服务。
