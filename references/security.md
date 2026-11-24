# API / Web 安全实践

> 目标：优先约束最常见、最有现实损害的 API 风险，不追求“安全机制越多越好”。

| ID | 决策 | 候选实践 |
| --- | --- | --- |
| SEC-01 | TBD | 认证只回答“你是谁”，授权必须单独回答“你能否操作这个对象/字段/功能”。 |
| SEC-02 | TBD | 每个按 ID 访问的用户资源都做对象级授权，不能因为 ID 难猜就默认安全。 |
| SEC-03 | TBD | 管理员/教练/普通用户等功能权限在服务端强制，不依赖前端隐藏按钮。 |
| SEC-04 | TBD | 输出字段也要授权；不要把整个数据库对象序列化后指望前端不展示敏感字段。 |
| SEC-05 | TBD | 写入字段使用 allowlist / 明确 schema，避免客户端提交任意对象属性造成 mass assignment。 |
| SEC-06 | TBD | 所有外部输入做服务端语法和语义校验，不能只依赖前端表单校验。 |
| SEC-07 | TBD | API 对执行时间、内存、上传大小、分页记录数、批量操作数等设置资源边界。 |
| SEC-08 | TBD | 对登录、验证码、密码找回、导出、昂贵分析等敏感流程做针对性的限流/防滥用。 |
| SEC-09 | TBD | SSRF 风险点对目标协议、主机、IP 范围和重定向做限制，不接受任意 URL 直连。 |
| SEC-10 | TBD | 密钥、数据库凭据、API token 不进源码和仓库，使用专门 secret/config 渠道。 |
| SEC-11 | TBD | 权限遵循最小化；服务账号只拿完成职责所需的资源和操作。 |
| SEC-12 | TBD | 公网入口默认 HTTPS；敏感凭据不放 URL query。 |
| SEC-13 | TBD | 公共错误响应不泄漏 stack、SQL、文件路径、内部 hostname、secret。 |
| SEC-14 | TBD | 第三方 API 返回也视为不可信输入，做 schema/范围/错误处理。 |
| SEC-15 | TBD | 维护 API inventory，知道哪些版本/域名/调试入口仍在线，避免遗忘旧接口。 |
| SEC-16 | TBD | 依赖与运行时版本有明确升级和漏洞响应策略，不能长期无人维护。 |
| SEC-17 | TBD | 敏感管理操作保留可追溯审计，但审计日志本身不记录 secret。 |
| SEC-18 | TBD | 文件上传验证大小、类型、内容边界和存储权限；用户文件不默认获得执行能力。 |
| SEC-19 | TBD | CORS 是浏览器访问控制，不是身份认证；不能用 CORS 代替服务端授权。 |
| SEC-20 | TBD | 安全机制必须验证正常合法路径仍可工作，避免“为了安全把系统锁死”。 |

## 主要来源

- OWASP API Security Top 10 — 2023
  https://api-security.owasp.org/editions/2023/en/0x11-t10/
- OWASP Top 10 — 2025
  https://top10.owasp.org/2025/
- OWASP API4 — Unrestricted Resource Consumption
  https://api-security.owasp.org/editions/2023/en/0xa4-unrestricted-resource-consumption/
