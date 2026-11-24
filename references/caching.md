# 缓存实践

> 目标：缓存只作为性能层，不让它偷偷变成第二个权威数据源。

| ID | 决策 | 候选实践 |
| --- | --- | --- |
| CACHE-01 | TBD | 先确认真实性能瓶颈再加缓存；缓存不是默认架构层。 |
| CACHE-02 | TBD | 缓存内容必须有明确权威来源，通常不能把 cache 当唯一 source of truth。 |
| CACHE-03 | TBD | Cache-aside 读路径应明确 miss → 读主存储 → 回填的行为。 |
| CACHE-04 | TBD | 主数据更新后优先失效相关缓存，避免维护复杂的“双写同步幻觉”。 |
| CACHE-05 | TBD | TTL 按业务可容忍陈旧时间设置，不按“经验值 5 分钟”拍脑袋。 |
| CACHE-06 | TBD | 即使有主动失效，也保留合理 TTL 作为失效事件丢失的兜底。 |
| CACHE-07 | TBD | 热 key 过期要考虑 stampede；必要时使用单飞、锁、提前刷新或 TTL jitter。 |
| CACHE-08 | TBD | 对不存在的对象可考虑短 TTL negative cache，防止穿透打爆主存储。 |
| CACHE-09 | TBD | 缓存 key 必须稳定、可解释，并包含影响结果的关键版本/租户/权限维度。 |
| CACHE-10 | TBD | 不把用户权限不同的数据错误共享同一个 cache key。 |
| CACHE-11 | TBD | 缓存大对象前评估序列化、网络和内存成本；命中缓存不代表成本低。 |
| CACHE-12 | TBD | Redis 等缓存必须设置明确内存上限和符合访问模式的 eviction policy。 |
| CACHE-13 | TBD | 持久数据与纯缓存数据职责差异大时，优先隔离，不让一个实例同时承担冲突策略。 |
| CACHE-14 | TBD | 监控 hit rate、miss rate、eviction、memory、latency，而不是只看 Redis“在线”。 |
| CACHE-15 | TBD | 缓存失效应可局部进行，避免一次普通写操作触发全局 flush。 |
| CACHE-16 | TBD | 高一致性、低延迟收益不明显的数据可以选择不缓存。 |
| CACHE-17 | TBD | 缓存层故障时明确降级策略；不能让“用于加速的组件”变成单点阻塞。 |
| CACHE-18 | TBD | 性能验收同时测 warm cache 与 cold cache，避免只在已预热条件下看起来很快。 |

## 主要来源

- Redis — Cache-aside
  https://redis.io/docs/latest/develop/use-cases/cache-aside/
- Redis — Key eviction
  https://redis.io/docs/latest/reference/eviction/
- Redis — Cache consistency strategies
  https://redis.io/blog/cache-consistency-strategies/
