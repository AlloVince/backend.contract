# REST API 设计实践

> 目标：约束 API 的外部行为与消费体验，不把 REST 当成“数据库表自动映射成 URL”。

| ID | 决策 | 候选实践 |
| --- | --- | --- |
| REST-01 | TBD | API 先从消费者需要完成的任务和读取模型设计，不先从数据库表逐张暴露。 |
| REST-02 | TBD | URL 优先表达资源而不是动作；常规 CRUD 使用标准 HTTP 方法表达行为。 |
| REST-03 | TBD | 同类资源命名、复数形式、层级和 ID 表达保持一致。 |
| REST-04 | TBD | 不把内部类名、表名、存储路径和实现细节泄漏成长期公共 API 契约。 |
| REST-05 | TBD | GET 只读；不得把删除、修改、发消息等副作用藏在 GET 参数里。 |
| REST-06 | TBD | HTTP 方法和状态码按标准语义使用，不自造“永远 200 + body.error”。 |
| REST-07 | TBD | 增长型集合必须定义分页或明确硬上限。 |
| REST-08 | TBD | 分页必须有稳定排序；否则翻页过程中容易重复或漏数据。 |
| REST-09 | TBD | 列表 API 只返回列表真正需要的字段；大对象、大序列、二进制内容按需加载。 |
| REST-10 | TBD | 支持真实需要的过滤、排序、字段选择，不强迫客户端下载全量再本地筛选。 |
| REST-11 | TBD | 页面高频需要的稳定汇总可以提供专门 read model / summary endpoint，不要求客户端拼几十个原子接口。 |
| REST-12 | TBD | 同一页面出现大量请求时先检查 API 粒度与读模型，不默认让前端继续并发更多请求。 |
| REST-13 | TBD | 不为“纯粹转发”新增 BFF / proxy；中间层必须有认证、聚合、协议转换等明确职责。 |
| REST-14 | TBD | 错误响应使用统一结构，至少能区分机器可处理的错误类型与面向人的说明。 |
| REST-15 | TBD | 对客户端可修复的参数错误给出明确 4xx；不要把输入错误包装成 500。 |
| REST-16 | TBD | 不暴露内部堆栈、SQL、密钥、文件路径等实现细节到公共错误响应。 |
| REST-17 | TBD | API 变更优先保持向后兼容；确需破坏性变更时才引入明确版本策略。 |
| REST-18 | TBD | API 契约应机器可读，优先维护 OpenAPI 等正式描述，而不是只靠散落文档和前端源码猜测。 |
| REST-19 | TBD | OpenAPI / Schema 必须与真实生产行为一致；“文档有定义”不等于真实入口已部署。 |
| REST-20 | TBD | 对创建、支付、提交任务等可能重复执行的写操作考虑显式幂等语义。 |
| REST-21 | TBD | API 的资源成本要有边界：每页记录数、上传大小、执行时间、批量操作数等。 |
| REST-22 | TBD | 后端接口设计必须看真实 SQL / 存储调用拓扑，避免一个看似简单的 endpoint 内部做 N+1。 |
| REST-23 | TBD | 对慢任务使用异步任务/状态资源时，必须让客户端能查询结果和失败状态，不靠长连接硬等。 |
| REST-24 | TBD | API 设计评审要用真实消费者路径验收，而不是只看路由表和单元测试。 |
| REST-25 | TBD | 同一业务概念只保留一个权威接口语义；避免多个近似 endpoint 各自计算不同口径。 |

## 主要来源

- RFC 9110 — HTTP Semantics
  https://datatracker.ietf.org/doc/html/rfc9110
- Zalando RESTful API and Event Guidelines
  https://opensource.zalando.com/restful-api-guidelines/
- Microsoft — Best practices for RESTful web API design
  https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design
- OpenAPI Specification 3.2
  https://spec.openapis.org/oas/v3.2
