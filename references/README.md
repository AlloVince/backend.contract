# references

这里放 `backend.contract` 的外部实践参考。它们不是 Contract，也不是默认全部采用。

目标是把业界成熟经验压缩成可逐条评审的候选规则，再逐条决定是否进入正式 Contract。

## 决策状态

- `TBD`：尚未评审。
- `ADOPT`：原则上直接采用。
- `MODIFY`：方向采用，但需要按我们的项目现实改写。
- `REJECT`：明确不采用，并应记录理由。

## 使用方式

1. 先读真实案例与项目现实。
2. 再逐条对照 references。
3. 不因为“最佳实践”四个字自动采用。
4. 每条进入正式 Contract 前，都要回答它解决哪个真实问题、适用边界是什么、能否自动检查、会不会增加新的复杂度。
5. 优先采用可以跨项目复用、又不会误伤正常路径的规则。

## 首批领域

- [后端架构与边界](architecture.md)
- [MySQL / 关系数据库实践](mysql.md)
- [REST API 设计](rest-api.md)
- [HTTP 语义](http-semantics.md)
- [事务、幂等与重试](transactions-idempotency.md)
- [缓存](caching.md)
- [消息与异步任务](messaging.md)
- [可观测性](observability.md)
- [API / Web 安全](security.md)
- [可靠性与发布](reliability-deployment.md)
- [对象存储](object-storage.md)

## 来源原则

优先级：正式标准 / 官方文档 > 大型成熟团队公开规范 > 被长期验证的行业实践。

这里保留的是总结后的候选规则，不复制原文。每篇末尾列主要来源。
