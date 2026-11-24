# 可靠性与发布实践

> 目标：发布流程可重复、可回滚、可观察；系统在部分失败和过载时保持可控。

| ID | 决策 | 候选实践 |
| --- | --- | --- |
| REL-01 | TBD | 构建应可重复；同一输入应能生成等价发布产物。 |
| REL-02 | TBD | 构建、测试、发布尽量自动化，减少每次临时手工脚本和“雪花式发布”。 |
| REL-03 | TBD | 同一生产环境/服务的发布责任尽量唯一，避免多个 CI 对同一变更重复触发。 |
| REL-04 | TBD | 发布变更保持小而可解释；大改动拆分要以降低真实风险为目的，不为流程而拆。 |
| REL-05 | TBD | 高风险变更优先渐进发布 / canary，而不是一次把全部流量切过去。 |
| REL-06 | TBD | 发布前明确 rollback / roll-forward 路径，不能等事故发生再想怎么恢复。 |
| REL-07 | TBD | 发现发布导致真实异常时优先恢复服务，再进行深层根因分析。 |
| REL-08 | TBD | 数据库 schema、配置、代码变更要考虑新旧版本短暂共存。 |
| REL-09 | TBD | 配置变更与代码变更都属于生产变更，都需要可追踪和恢复。 |
| REL-10 | TBD | 所有远程调用设置合理连接/请求超时，避免资源无限占用。 |
| REL-11 | TBD | 重试只用于瞬时且可安全重试的失败；使用 backoff、jitter 和上限。 |
| REL-12 | TBD | 系统过载时优先限流、背压、降级，而不是让更多重试放大故障。 |
| REL-13 | TBD | readiness 表示“是否应该接流量”，liveness 表示“是否需要重启”；两者不要混成一个 health。 |
| REL-14 | TBD | 错误的 liveness 可能制造级联重启；只有确实不可恢复的进程状态才应触发重启。 |
| REL-15 | TBD | 进程退出/发布切换时支持 graceful shutdown，停止接新流量并完成/中止已有工作。 |
| REL-16 | TBD | 服务健康验收至少包含真实关键用户路径，不把进程存活当业务可用。 |
| REL-17 | TBD | 发布后观察 error、latency、traffic、saturation 和业务关键指标，而不是只看 deploy 命令成功。 |
| REL-18 | TBD | 性能/容量门槛来自平台限制、SLO 或实测基线，不凭经验写死。 |
| REL-19 | TBD | 限额、配额、第三方计费属于可靠性边界；发布/批处理不能意外耗尽全天额度。 |
| REL-20 | TBD | 批量任务有 checkpoint、可恢复和停止条件，避免失败后从头重做全部工作。 |
| REL-21 | TBD | 冷备份、灾备、回滚产物必须实际演练恢复；存在不代表可用。 |
| REL-22 | TBD | 依赖故障时明确 fail-open / fail-closed / degraded 行为，不能让代码临场决定。 |
| REL-23 | TBD | 关键资源设置容量边界和监控，避免直到 CPU、内存、连接、磁盘打满才知道。 |
| REL-24 | TBD | 生产事故复现次数不是可靠性指标；必须证明根因和资源增长模式已经消失。 |
| REL-25 | TBD | 运维保护机制也要验正常路径与恢复路径，不能只证明“危险操作被拒绝”。 |

## 主要来源

- Google SRE — Release Engineering / Canarying Releases
  https://sre.google/workbook/canarying-releases/
- Google SRE — Production Services Best Practices
  https://sre.google/sre-book/service-best-practices/
- AWS Builders’ Library — Timeouts, retries and backoff with jitter
  https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
- Kubernetes — Liveness, Readiness, and Startup Probes
  https://kubernetes.io/docs/concepts/workloads/pods/probes/
