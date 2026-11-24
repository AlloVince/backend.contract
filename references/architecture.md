# 后端架构与边界实践

> 目标：选择适合团队规模、运行平台和业务演进速度的架构，不把微服务、事件驱动、缓存或网关当成现代化的默认答案。

| ID | 决策 | 候选实践 |
| --- | --- | --- |
| ARCH-01 | TBD | 默认先用边界清楚的模块化单体；只有独立部署、扩缩容、故障隔离或组织协作确有需要时，再拆独立服务。 |
| ARCH-02 | TBD | 模块边界按业务职责和数据责任划分，不按文件类型或技术层机械拆服务。 |
| ARCH-03 | TBD | 同一业务事务尽量留在一个明确的一致性边界内；跨服务流程应显式接受并处理部分成功。 |
| ARCH-04 | TBD | 独立服务应有明确 Owner、独立部署理由、输入输出契约和故障边界。 |
| ARCH-05 | TBD | 不为纯转发增加 BFF / API Gateway；中间层必须提供认证、聚合、限流、协议转换或其他可说明的价值。 |
| ARCH-06 | TBD | 浏览器前端直接访问面向浏览器的 API；若必须代理，应明确代理解决的具体问题。 |
| ARCH-07 | TBD | 按运行时和数据路径选择计算位置；静态文件、大对象和重计算不应无理由经过同一个请求处理器。 |
| ARCH-08 | TBD | Serverless / Edge 不是“无限资源”；设计时必须核对 CPU、内存、启动、子请求、连接数和计费边界。 |
| ARCH-09 | TBD | 优先使用托管平台提供的原生数据库、对象存储、队列和部署能力，除非自建有明确收益。 |
| ARCH-10 | TBD | 采用多种存储应由访问模式、事务需求、成本或数据类型驱动；避免为了技术潮流堆叠数据库。 |
| ARCH-11 | TBD | 同步调用用于需要即时结果且成本可控的路径；只有独立执行、削峰、重试或解耦有价值时才引入队列。 |
| ARCH-12 | TBD | API-first 应建立机器可读契约并对真实实现做一致性检查；不要把 OpenAPI 文件本身当成契约已执行的证明。 |
| ARCH-13 | TBD | 优先使用标准化协议和通用可观测性语义，降低跨运行时、供应商和工具链的迁移成本。 |
| ARCH-14 | TBD | 服务间避免聊天式细粒度调用；优先让一个请求完成一个明确用户任务所需的最小数据读取。 |
| ARCH-15 | TBD | 共享数据库不自动等于微服务；若多个模块共享数据，应明确表/字段所有权和写入边界。 |
| ARCH-16 | TBD | 先保证模块内聚、依赖方向、测试与部署可靠，再考虑微服务、服务网格、复杂编排等额外基础设施。 |
| ARCH-17 | TBD | 技术选型比较全生命周期成本：开发、调试、观测、发布、故障恢复、平台配额和退出成本。 |
| ARCH-18 | TBD | 架构图和代码目录只能作为证据之一；必须核实真实请求路径、真实部署入口和真实数据流。 |

## 主要来源

- Microsoft Azure Architecture Center — Microservices architecture style（明确列出复杂度、网络调用、数据一致性和运维成本）
  https://learn.microsoft.com/en-us/azure/architecture/microservices/
- Microsoft — Microservices Assessment and Readiness
  https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/microservices-assessment
- OpenAPI Specification v3.2.1（2026-09-10）
  https://spec.openapis.org/oas/v3.2.1
- OpenTelemetry Semantic Conventions 1.44.0
  https://opentelemetry.io/docs/specs/semconv/
- Cloudflare Workers platform limits（2026-10-12）
  https://developers.cloudflare.com/workers/platform/limits/
