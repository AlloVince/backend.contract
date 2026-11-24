# 对象存储实践

> 目标：明确原始备份、产品对象、临时文件和用户访问之间的边界，不把“都能放文件”当成同一种职责。

| ID | 决策 | 候选实践 |
| --- | --- | --- |
| OBJ-01 | TBD | bucket / prefix 按数据责任、生命周期、权限和公开范围设计，不只按文件类型分。 |
| OBJ-02 | TBD | 原始备份、产品发布对象、临时处理中间产物的生命周期不同，应能独立治理。 |
| OBJ-03 | TBD | 默认私有；需要公开的对象应有明确业务理由和独立公开策略。 |
| OBJ-04 | TBD | 临时访问优先使用 scoped、短期 presigned URL / temporary credentials，不暴露长期密钥。 |
| OBJ-05 | TBD | presigned URL 按 bearer token 对待；拿到 URL 的人可在有效期内执行已签名操作。 |
| OBJ-06 | TBD | presigned 权限应限制到具体操作、对象/路径和尽可能短的有效期。 |
| OBJ-07 | TBD | 浏览器直传/直下可避免应用服务器中转大文件，但必须保留权限、大小、类型等控制。 |
| OBJ-08 | TBD | 大文件下载不要无意义经过 Worker/API 读取后再原样吐回，优先直接对象存储/CDN 路径。 |
| OBJ-09 | TBD | object key 是持久标识的一部分；命名应稳定、可生成、避免依赖用户可变显示名。 |
| OBJ-10 | TBD | 避免 `.` / `..` 等容易被不同路径实现归一化成不同结果的 key 片段。 |
| OBJ-11 | TBD | 覆盖同 key 前明确是否允许；备份/原始数据通常更适合 immutable key 或 versioning。 |
| OBJ-12 | TBD | versioning 解决误删/覆盖恢复，但会产生存储成本；必须配 lifecycle，而不是无限保留。 |
| OBJ-13 | TBD | lifecycle 规则按数据价值制定；临时产物自动过期，正式原始备份按恢复需求保留。 |
| OBJ-14 | TBD | 普通应用发布不能顺带清空或重建备份桶，除非这是明确的数据迁移操作。 |
| OBJ-15 | TBD | 应用展示路径不应泄漏内部 bucket 结构、原始包命名或敏感存储拓扑。 |
| OBJ-16 | TBD | 上传完成后需要时校验 checksum / size，不能只因 HTTP 成功就默认对象完整。 |
| OBJ-17 | TBD | 权限遵循最小化：发布、读取、备份、清理可以是不同角色，不默认一把 key 全权限。 |
| OBJ-18 | TBD | 记录对象来源、版本或业务归属时，元数据应有权威来源，不能只靠文件名猜。 |
| OBJ-19 | TBD | 删除策略区分“产品不再展示”和“物理永久删除”，避免业务删除直接毁掉恢复能力。 |
| OBJ-20 | TBD | 对象存储成本评审同时看请求次数、Class A/B 操作、带宽和存储量，不只看 GB 单价。 |

## 主要来源

- Cloudflare R2 — Presigned URLs
  https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- Cloudflare R2 — Object lifecycles
  https://developers.cloudflare.com/r2/buckets/object-lifecycles/
- Amazon S3 — Security best practices
  https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html
- Amazon S3 — Object keys
  https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
