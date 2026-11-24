# MySQL / 关系数据库实践

> 目标：整理“数据库军规”类成熟经验，但不把历史口号机械搬进 Contract。以后逐条评审。

| ID | 决策 | 候选实践 |
| --- | --- | --- |
| MYSQL-01 | TBD | 事务型业务表优先使用 InnoDB，除非有明确理由选择其他引擎。 |
| MYSQL-02 | TBD | 每张核心表都显式定义主键，不依赖数据库隐式生成的聚簇键。 |
| MYSQL-03 | TBD | InnoDB 主键尽量短、稳定，避免把宽字符串或频繁变化字段作为主键。 |
| MYSQL-04 | TBD | 数据类型按真实语义选择，避免为了“以后可能用到”无脑放大长度和精度。 |
| MYSQL-05 | TBD | 语义上不允许缺失的字段使用 `NOT NULL`，不要用 NULL 表示多个不同含义。 |
| MYSQL-06 | TBD | 业务唯一性应有可执行约束；不能只靠“代码一般不会重复”。 |
| MYSQL-07 | TBD | 索引围绕真实查询设计，不为每个字段机械创建单列索引。 |
| MYSQL-08 | TBD | 复合索引应按实际过滤、排序、连接模式设计，避免大量互相重叠的索引。 |
| MYSQL-09 | TBD | 新增索引要同时考虑写放大、存储和缓存成本；索引不是免费性能。 |
| MYSQL-10 | TBD | 重要查询和慢查询必须用 `EXPLAIN` / 执行计划验证，而不是凭 SQL 外观判断。 |
| MYSQL-11 | TBD | 大表查询避免无条件全表扫描；如果全表扫描是合理方案，要能解释数据规模与成本。 |
| MYSQL-12 | TBD | 增长型集合查询必须有明确边界：分页、硬上限或可证明的小规模约束。 |
| MYSQL-13 | TBD | 深分页数据量大时优先评估 keyset / seek pagination，不默认无限使用大 OFFSET。 |
| MYSQL-14 | TBD | 事务只覆盖保持一致性真正需要的操作，避免无意义的长事务。 |
| MYSQL-15 | TBD | 不在数据库事务中等待外部 HTTP、文件上传、用户输入或其他不可控慢操作。 |
| MYSQL-16 | TBD | 修改多表或多行时尽量保持一致的访问顺序，以降低死锁概率。 |
| MYSQL-17 | TBD | 把死锁视为正常并发现象之一；关键事务应能识别并安全重试，而不是假设绝不会死锁。 |
| MYSQL-18 | TBD | 避免长时间 `idle in transaction`，因为它会持有快照/锁并妨碍清理。 |
| MYSQL-19 | TBD | 批量写入优先使用批量 INSERT / bulk load，而不是大量单行往返。 |
| MYSQL-20 | TBD | 列表接口不要为了返回几十行结果先读取成千上万行再在应用内截断。 |
| MYSQL-21 | TBD | 数据库约束、应用校验和业务模型各自有职责；不要把所有完整性都推给任意一层。 |
| MYSQL-22 | TBD | 外键是否采用按项目边界决定；若拒绝外键，也必须有可执行的一致性维护与孤儿数据检查方案。 |
| MYSQL-23 | TBD | Schema migration 应可审计、可重复执行，并考虑新旧代码短时间共存时的兼容性。 |
| MYSQL-24 | TBD | 备份不是“有文件就行”；需要实际验证恢复，并明确恢复点目标与数据丢失窗口。 |
| MYSQL-25 | TBD | 性能优化先测真实慢点，再改索引/SQL/Schema；不凭经验规则发明性能门槛。 |

## 主要来源

- MySQL 8.4 Reference Manual — Optimization and Indexes
  https://dev.mysql.com/doc/refman/8.4/en/optimization-indexes.html
- MySQL 8.4 — Optimizing InnoDB Queries
  https://dev.mysql.com/doc/refman/8.4/en/optimizing-innodb-queries.html
- MySQL 8.4 — Optimizing InnoDB Transaction Management
  https://dev.mysql.com/doc/refman/8.4/en/optimizing-innodb-transaction-management.html
- MySQL 8.4 — How to Minimize and Handle Deadlocks
  https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlocks-handling.html
- PostgreSQL — Transaction Isolation（用于交叉验证通用事务实践）
  https://www.postgresql.org/docs/current/transaction-iso.html
