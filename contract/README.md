# Backend Contract v0.3.0

适用于所有后端形态，包括本地 CLI、数据构建、服务和线上应用。统一设计判断，不统一技术栈或工程规模。

- [DESIGN-REVIEW.md](DESIGN-REVIEW.md)：最高优先级禁止自锁及用户确认的八项设计原则，设计前复查入口。
- [AGENT.md](AGENT.md)：开发入口。
- 按实际涉及的能力读取：[架构](ARCHITECTURE.md)、[API](API.md)、[数据](DATA.md)、[安全](SECURITY.md)、[可靠性与运行](RELIABILITY.md)。
- [GATES.md](GATES.md)：复用真实确定性检查；[REVIEW.md](REVIEW.md)：验证实际结果。

Gate、Agent、Review 相互补充。设计无需安装 Contract；不适用的专题无需读取或实现。不建立第二套项目治理、审批或合规清单。用户明确原则优先，项目具体业务约束由其 Owner 决定。
