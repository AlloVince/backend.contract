# HTTP 语义实践

> 目标：把 HTTP 自带的语义用对，减少自定义协议和重试/缓存歧义。

| ID | 决策 | 候选实践 |
| --- | --- | --- |
| HTTP-01 | TBD | GET、HEAD、OPTIONS 等安全方法不应承担业务状态修改。 |
| HTTP-02 | TBD | PUT、DELETE 等幂等方法应保持“重复同一请求不会重复产生业务效果”的语义。 |
| HTTP-03 | TBD | POST 默认不能假设可安全自动重试；需要重复提交保护时显式设计幂等键或等价机制。 |
| HTTP-04 | TBD | 2xx / 4xx / 5xx 按“请求成功 / 客户端问题 / 服务端问题”真实使用。 |
| HTTP-05 | TBD | 404 表示目标资源不存在，不用 200 + null 掩盖所有不存在场景。 |
| HTTP-06 | TBD | 已知方法但资源不允许时使用 405，并提供正确的 Allow 信息时优先遵循标准。 |
| HTTP-07 | TBD | 创建资源后适合时返回 201，并让客户端知道新资源位置。 |
| HTTP-08 | TBD | 无响应体的成功操作可使用 204，不强迫返回无意义 JSON。 |
| HTTP-09 | TBD | 缓存行为使用 Cache-Control、ETag、Last-Modified 等标准机制，不自造缓存协议。 |
| HTTP-10 | TBD | 可缓存 GET 优先利用条件请求减少重复传输，而不是每次重新下载全部内容。 |
| HTTP-11 | TBD | 对 Range / 大文件下载按标准语义实现，不用整文件转发伪装分段读取。 |
| HTTP-12 | TBD | Content-Type 必须描述真实响应体；客户端不应靠猜格式解析。 |
| HTTP-13 | TBD | 服务端不应把内部异常文本直接塞进 HTTP reason / body 暴露实现细节。 |
| HTTP-14 | TBD | 重定向状态码按“临时 / 永久、是否保留方法”语义选择，不随便统一用 302。 |
| HTTP-15 | TBD | 反向代理、CDN、Worker 等中间层不能改变原请求的核心业务语义而不明确记录。 |
| HTTP-16 | TBD | 对跨域访问使用明确 CORS 策略，不用全开放作为默认修复。 |
| HTTP-17 | TBD | 对请求体、响应体、header 大小设合理边界，防止无界资源消耗。 |
| HTTP-18 | TBD | 压缩、缓存、Range 等优化只用于有真实收益的数据，不为所有接口机械启用。 |

## 主要来源

- RFC 9110 — HTTP Semantics
  https://datatracker.ietf.org/doc/html/rfc9110
- RFC 9111 — HTTP Caching
  https://datatracker.ietf.org/doc/html/rfc9111
