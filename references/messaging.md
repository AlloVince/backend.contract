# 消息、事件与异步任务实践

> 目标：把“异步”当成失败会发生、消息会重复、处理会中断的系统，而不是把函数调用换成队列就结束。

| ID | 决策 | 候选实践 |
| --- | --- | --- |
| MSG-01 | TBD | 默认假设消息至少可能重复投递；消费者必须能安全处理重复消息。 |
| MSG-02 | TBD | 消费者的幂等边界围绕业务效果设计，不只围绕“是否见过 message ID”。 |
| MSG-03 | TBD | 消息确认应发生在关键业务副作用已可靠落盘之后。 |
| MSG-04 | TBD | 不在处理尚未完成时提前 ack，以免进程退出后永久丢失任务。 |
| MSG-05 | TBD | 对 poison message 设有限重试和隔离策略，避免同一坏消息无限阻塞队列。 |
| MSG-06 | TBD | Retry / DLQ 必须保留原始错误、次数、时间和关联 ID，便于恢复和审计。 |
| MSG-07 | TBD | 不把 DLQ 当垃圾桶；进入 DLQ 的消息必须有明确查看、重放或丢弃流程。 |
| MSG-08 | TBD | 消息顺序要求必须显式声明；不能默认整个系统全局有序。 |
| MSG-09 | TBD | 需要顺序时按稳定业务 key 分区，并接受顺序范围通常只在分区内成立。 |
| MSG-10 | TBD | 事件 payload 包含消费者真正需要的稳定字段，避免消费者依赖生产者内部数据库。 |
| MSG-11 | TBD | 消息 schema 要可版本化；新增字段优先向后兼容。 |
| MSG-12 | TBD | 生产者与消费者的部署不能要求绝对同时升级。 |
| MSG-13 | TBD | 队列积压、消费延迟、失败率、重试率应有监控，不只监控 broker 存活。 |
| MSG-14 | TBD | 大量重试应有 backoff / jitter，避免下游恢复时产生 thundering herd。 |
| MSG-15 | TBD | 下游不可用时要有 backpressure 或容量边界，不能无限堆积到磁盘/内存耗尽。 |
| MSG-16 | TBD | “exactly once”只在技术真实保证的范围内使用；跨外部副作用仍要设计幂等。 |
| MSG-17 | TBD | 对重要事件明确 retention 和 replay 能力，不把队列默认当永久审计日志。 |
| MSG-18 | TBD | 异步任务必须能查询状态和最终失败，不允许任务“发出去就不知道了”。 |
| MSG-19 | TBD | 任务执行中断后应从可靠 checkpoint / 状态恢复，而不是靠日志猜已经做到哪里。 |
| MSG-20 | TBD | 如果同步调用更简单、成本可控，就不要为了“解耦”强行引入消息系统。 |

## 主要来源

- Apache Kafka — Design / Message Delivery Semantics
  https://kafka.apache.org/design/
- Apache Kafka — Producer Configuration / Idempotence
  https://kafka.apache.org/documentation/#producerconfigs
- AWS — Retry / backoff guidance
  https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_mitigate_interaction_failure_limit_retries.html
