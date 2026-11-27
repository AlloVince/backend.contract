# Backend Contract 实施

当前 v0.5.0：以 DESIGN-00 禁止自锁为最高工程约束，保留十项用户设计原则及少量跨项目工程专题。补充 Schema 真实消费与反证方法。取消合规基线、Strict/Incremental、独立验收清单和重复规则。

- Design / Agent：设计前复查与开发过程约束，无需安装。
- Gate：复用项目真实检查，不建立第二套合规门禁。
- Review：核实受影响的真实行为，不强制报告模板。
- CLI：可选 create / adopt / check / review / update；不重复实现项目工具，更新时保护已有用户内容。

后续只在真实消费者暴露有价值的跨项目缺口时调整。项目自己的业务规则、部署和测试仍由项目 Owner 决定。
