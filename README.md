# Backend Contract v0.4.0

适用于所有项目的后端设计与工程原则，不是框架或合规体系。

**最高优先级：禁止自锁。** 不以自设状态、版本、Hash、冻结、审批或基线阻止合法工作。冲突的规则与实现直接删除或修正；保留真实安全和数据完整性约束。

## 使用

直接对 Agent 说“用 Backend Contract 复查这个设计”，阅读 [DESIGN-REVIEW.md](contract/DESIGN-REVIEW.md) 和相关专题。不要求项目安装、配置或执行 CLI。

[正式规范入口](contract/README.md) 包含设计原则、Agent、Gate 与 Review。各项目只使用与真实业务相关的规则。

## 可选 CLI

Node.js 22.16 或更高版本（低于 27）。

~~~bash
node bin/contract.mjs create ~/Developer/new.backend
node bin/contract.mjs adopt ~/Developer/existing.backend
node bin/contract.mjs check ~/Developer/existing.backend
node bin/contract.mjs check ~/Developer/existing.backend --run
node bin/contract.mjs review ~/Developer/existing.backend
node bin/contract.mjs update ~/Developer/existing.backend
~~~

create 创建语言无关的起点；adopt 安装规范并保留项目文件；update 更新未修改的规范副本，保留本地内容。check --run 只执行 manifest 中显式配置的检查命令，不猜测命令；没有配置或检查未运行时如实提示，不阻塞。真实检查失败及无效命令配置仍返回失败。review 无需安装，默认只读输出线索，可用 --out=相对路径保存。

旧 Strict / Incremental 模式、Baseline 及独立验收清单已取消。版本和 Hash 仅用于记录与避免意外覆盖，不参与运行授权。历史消费者升级时保留含项目内容的旧文件。

## 维护

owner/PROJECT.md 保存目标；contract/ 是唯一正式规则；real-cases/ 保留真实反例。旧候选实践和草案从 Git 历史追溯，不再维持第二套规范。新增规则必须能减少真实错误或成本，否则不增加。

本仓测试：npm test。
