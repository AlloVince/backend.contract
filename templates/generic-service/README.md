# Backend Service

这是一个语言与框架无关的后端工程起点，不是可直接部署的服务实现。

开始前：

1. 选择与真实需求匹配的语言、运行时、Web 框架和数据库。
2. 在项目 Owner 中明确业务目标、数据 Owner、消费者和部署边界。
3. 将选定的 lint、类型检查、测试、构建或迁移验证命令写入 backend-contract.json 的 checks 数组。
4. 阅读 docs/backend-contract/AGENT.md 和相关专题规范。
5. 运行 Backend Contract 检查，并为业务不变量补充项目自己的测试。

建议先按职责组织代码，而不是先按技术类型堆叠目录。src、tests、migrations 只是起始位置，可以根据项目实际形态调整。
