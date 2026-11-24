# 可观测性实践

> 目标：让系统能回答“用户哪里坏了、为什么坏、从哪次请求开始”，而不是只有一堆日志。

| ID | 决策 | 候选实践 |
| --- | --- | --- |
| OBS-01 | TBD | 用户可感知服务至少关注 latency、traffic、errors、saturation 四类信号。 |
| OBS-02 | TBD | 成功请求和失败请求的延迟分开看，避免快速失败把平均延迟“优化”得很好看。 |
| OBS-03 | TBD | 同时保留黑盒症状监控与白盒内部指标；二者不能互相替代。 |
| OBS-04 | TBD | 告警优先围绕真实用户症状，而不是每个内部异常都 page 人。 |
| OBS-05 | TBD | 每个会叫醒人的告警都应可行动；无明确行动的告警应降级或删除。 |
| OBS-06 | TBD | 健康检查只证明对应检查项；不能把 `/health=200` 当成用户业务链路健康。 |
| OBS-07 | TBD | 关键请求拥有稳定 request / trace / correlation ID，并贯穿主要下游调用。 |
| OBS-08 | TBD | 日志使用结构化字段，不依赖正则从自然语言里猜 user/session/request。 |
| OBS-09 | TBD | 跨服务字段命名优先采用 OpenTelemetry 等统一语义约定。 |
| OBS-10 | TBD | 日志、指标、trace 能通过共同标识互相跳转。 |
| OBS-11 | TBD | 平台层终止、应用异常、客户端错误分别记录，不能因应用日志未完成就判定“没有错误”。 |
| OBS-12 | TBD | 记录关键资源成本：DB 查询次数/耗时、外部调用、CPU、内存、对象存储等，而不只看 HTTP 总时长。 |
| OBS-13 | TBD | 对集合/批处理记录输入规模，才能识别“同一 endpoint 随 N 线性/平方放大”。 |
| OBS-14 | TBD | 日志不得包含密码、token、完整敏感凭据或不必要的个人数据。 |
| OBS-15 | TBD | 高基数字段进入 metrics 前谨慎评估，避免 user ID 等导致指标系统爆炸。 |
| OBS-16 | TBD | tracing / logging 采样策略应保留错误和慢请求，不只随机丢弃。 |
| OBS-17 | TBD | 观测系统自身也要有失败语义；“没有数据”不能自动解释成“系统正常”。 |
| OBS-18 | TBD | 生产事故排查顺序先看已有平台日志、应用日志、trace、指标，再判断缺什么观测。 |
| OBS-19 | TBD | Dashboard 应回答常见运行问题；长期没人看、没人告警使用的指标应考虑删除。 |
| OBS-20 | TBD | 线上变更验收应包含真实用户路径和资源指标，而不是只确认服务启动。 |

## 主要来源

- Google SRE — Monitoring Distributed Systems
  https://sre.google/sre-book/monitoring-distributed-systems/
- OpenTelemetry — Semantic Conventions
  https://opentelemetry.io/docs/concepts/semantic-conventions/
