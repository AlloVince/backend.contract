# 事务、幂等与重试实践

> 目标：面对网络失败、并发和重复执行时，让系统结果可预测。

| ID | 决策 | 候选实践 |
| --- | --- | --- |
| TX-01 | TBD | 事务边界围绕一个明确业务不变量，不把整个请求生命周期无脑包进事务。 |
| TX-02 | TBD | 事务尽量短，避免在事务中等待网络、文件、队列或人工操作。 |
| TX-03 | TBD | 需要跨多行/多表保持一致时，先明确原子性边界，再决定事务实现。 |
| TX-04 | TBD | 并发更新同一资源时明确采用乐观锁、悲观锁、唯一约束或原子 SQL，不能靠“通常不会同时发生”。 |
| TX-05 | TBD | 数据库死锁应允许事务级重试；重试前必须确保整个事务可安全重放。 |
| TX-06 | TBD | 对可能重复到达的业务命令设计业务级幂等，而不是只依赖 HTTP 方法名。 |
| TX-07 | TBD | 一个幂等键只代表一个逻辑操作；同一键不得对应不同 payload。 |
| TX-08 | TBD | 幂等结果应有明确保存期限、作用域和冲突行为。 |
| TX-09 | TBD | 客户端重试必须复用原幂等键，不能每次重试重新生成。 |
| TX-10 | TBD | 非幂等写请求不应被代理、SDK、队列消费者无条件自动重试。 |
| TX-11 | TBD | 所有远程调用应有超时；无限等待不是可靠性策略。 |
| TX-12 | TBD | 瞬时失败重试使用指数退避，并加入 jitter，避免同步重试风暴。 |
| TX-13 | TBD | 重试必须有上限或总时间预算；失败系统不能被无限重试压垮。 |
| TX-14 | TBD | 只在最合适的一层负责重试，避免 SDK、网关、服务、队列多层叠加重试。 |
| TX-15 | TBD | 对“数据库写成功但消息发送失败”等双写问题，不假设两边会碰巧一致。 |
| TX-16 | TBD | 跨系统一致性优先采用可恢复、可重放的事件/outbox/saga 类模式，而不是伪造分布式原子性。 |
| TX-17 | TBD | 外部操作已经成功但响应丢失时，系统应能通过幂等键或状态查询恢复确定结果。 |
| TX-18 | TBD | 任何“exactly once”声明都必须明确作用边界；跨数据库、队列和外部服务时默认保持怀疑。 |
| TX-19 | TBD | 失败恢复设计必须覆盖部分成功，不只覆盖“全部成功 / 全部失败”。 |
| TX-20 | TBD | 重试与补偿逻辑必须有真实故障测试，不接受只看 happy path。 |

## 主要来源

- RFC 9110 — Idempotent Methods
  https://datatracker.ietf.org/doc/html/rfc9110#section-9.2.2
- Stripe — Designing robust APIs with idempotency
  https://stripe.com/blog/idempotency
- AWS Builders’ Library — Timeouts, retries and backoff with jitter
  https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
