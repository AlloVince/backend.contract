# Core：第一批机器可审计核心规则（扩展版）

> **状态：Draft，不是正式 Contract。** 当前包含原先从 229 条行业实践中筛出的 15 组、从 Golf 已踩过的后端问题和 Owner 边界补充的 11 组，以及 3 组需要 Agent Review 或明确不值得自动化的评审主题。行业候选仍为 229 条；新增项目规则是从真实经验提炼，不伪装成行业标准。

## 1. 检测分类

每组只标一个主要落地方式。混合场景在“边界”中说明，不把局部可检测夸大成整组都能自动证明。

| 分类 | 含义 | 可以证明什么 |
| --- | --- | --- |
| **现成工具可直接检测** | 复用数据库、GitHub、OpenAPI、Secret Scanner 等已有能力，不需要编写业务语义检测器。 | 工具能明确覆盖的语法、结构、已知漏洞或 CI 状态。 |
| **需要项目专属检测** | 用现有测试框架、CLI、SQL introspection、浏览器测试或少量脚本，针对本项目的不变量写检查。 | 已编码的项目规则和测试场景；不能自动推断未定义的业务语义。 |
| **Agent Review** | 需要结合 Owner、真实数据、业务意图和实际结果判断。机器负责收集证据，Agent 给出有依据的判断。 | 设计取舍、业务含义和新出现的异常；不能冒充确定性硬门禁。 |
| **不值得自动化** | 通用规则无法可靠判定，或自动化成本/误伤高于收益。保留为评审提醒，不开发检测器。 | 不强行生成“通过/失败”状态。 |

**一个重要区别：** 使用 pytest 写的测试、用 SQL 查询 schema 的脚本，虽然不是传统现成扫描器，但仍然是机器可重复执行的硬检查，归入“需要项目专属检测”。“没有统一工具”不等于“只能靠 Agent 自觉”。

本版 29 组的主要检测分类：

| 检测分类 | 组数 | 说明 |
| --- | ---: | --- |
| 现成工具可直接检测 | 3 | CI 必需状态、Secret 扫描、OpenAPI 文件校验/兼容性。 |
| 需要项目专属检测 | 21 | 用现有测试、数据库 introspection、CLI、浏览器和发布 manifest 检查本项目不变量。 |
| Agent Review | 3 | 业务数据语义、领域 API 模型、业务/物理常识。 |
| 不值得自动化 | 2 | 架构取舍和性能阈值依据，不开发通用检测器。 |

按落地优先级：P0 为 14 组，P1 为 10 组；另有 3 组 Agent Review 和 2 组不值得自动化。分类按每组的主要方式统计，部分规则仍需要组合证据。

## 2. P0：优先落地或复用的确定性约束

| # | 核心规则 | 来源 | 检测分类 | 自动检测方式 | 当前项目证据与边界 |
| --- | --- | --- | --- | --- | --- |
| **1** | 模块依赖和数据写入必须遵守 Owner 边界 | ARCH-02、MYSQL-21、MYSQL-22；A-07、A-08 | **需要项目专属检测** | 静态分析 import/dependency graph；结合 schema 和写入路径检查表/字段 Owner；提供违规与合法 fixture。 | Importer 已有 `test_internal_api_boundary.py`、`test_capability_boundaries.py`、`test_schema_colours.py`。复用并核实 CI 覆盖，不再造第二套。跨颜色外键、表颜色等属于 Golf 项目规则，不是所有后端的通用限制。 |
| **2** | 业务唯一性必须由持久层约束，并对迁移和冲突做回归验证 | MYSQL-06、MYSQL-23 | **需要项目专属检测** | 检查主键/唯一约束；临时数据库中重复写入、冲突写入、迁移重复执行；验证失败时不产生部分修改。 | Importer 有 `test_direct_persistence.py`、`test_identity.py`。数据库唯一约束只能防止已定义的键重复，不能替代对“这个键是否代表同一业务实体”的验证；见第 16 组。 |
| **3** | 增长型集合必须有硬边界和稳定分页 | REST-07、REST-08、REST-21、MYSQL-12、MYSQL-20；A-03、A-04 | **需要项目专属检测** | 用超过单页的数据测试最大页大小、稳定排序、翻页无重复/漏项、非法参数 4xx；结合 SQL/读取计数确认不是全量读入内存再切片。 | Importer 的 `tests/api/test_read_routes.py` 已覆盖 cursor、页大小和错误参数；按每个真实集合补齐，不统一发明所有项目的页大小。 |
| **4** | 服务端必须执行对象级授权和明确的输入字段校验 | SEC-01、SEC-02、SEC-03、SEC-05、SEC-06 | **需要项目专属检测** | 对受保护路由建立权限矩阵：未登录、本人、他人、不同角色、额外字段、无效输入；断言状态码和数据库副作用。 | Importer 有 `tests/api/test_auth.py`、`test_read_routes.py`。已有部分测试不代表所有路由都覆盖；前端隐藏按钮不是授权证据。 |
| **5** | 重复执行和部分失败必须可安全恢复 | TX-06、TX-19、TX-20 | **需要项目专属检测** | 对相同输入重复执行；在数据库写入/对象上传中途注入失败后重跑；比较稳定 ID、业务关系、人工数据和对象状态。 | Importer 的 `test_cli_contract.py`、`test_direct_persistence.py`、`test_pipeline.py`、`test_publication.py` 已覆盖部分路径。不得用访问 NAS 或生产全量重导入作为普通测试。 |
| **6** | 原始备份、产品对象和临时产物必须有独立生命周期；备份默认私有 | OBJ-01、OBJ-02、OBJ-03、OBJ-06、OBJ-07；A-09 | **需要项目专属检测** | 检查发布清单和存储 binding；测试产品发布、替换、失败恢复不会删除/公开来源备份；非公开对象必须经授权读取。 | Importer 的 `test_publication.py`、`test_deployment_boundary.py` 已有相关保护。对象是否使用 presigned URL 可按平台选择，权限与生命周期边界不能省略。 |
| **7** | 必需检查缺失或无法执行时，CI 必须失败 | REL-02、REST-19、SEC-20 | **现成工具可直接检测** | 使用 GitHub Actions required status checks / rulesets；工作流对必需 job 失败、跳过或未运行时保持非绿色。 | Importer 的 `quality.yml` 已运行质量检查。需核实仓库保护规则确实要求这些 status checks；仅在 YAML 中写了 job，不代表合并门禁已启用。 |
| **8** | 防止密钥进入代码，并限制部署凭据权限 | SEC-10、SEC-11 | **现成工具可直接检测** | 复用 GitHub Secret Scanning、Dependabot 或 Gitleaks 等现成扫描器；检查 workflow 的 token permissions 和环境 Secret 范围。 | 先核实 GitHub 仓库当前已启用的扫描能力；已有工具就复用。扫描器不能证明运行日志、外部系统和历史泄漏均安全。 |
| **9** | HTTP 方法、状态码和输入错误必须表达真实行为 | REST-05、REST-06、REST-15、HTTP-01、HTTP-04 | **需要项目专属检测** | 行为测试验证 GET 不改变业务状态；资源不存在、参数错误、权限不足和服务故障分别返回正确语义；合法请求仍成功。 | Importer 的 `test_read_routes.py` 已覆盖多种 400/404。不要仅凭路由名或静态搜索推断 GET 无副作用。 |
| **16** | 稳定设备身份、业务记录身份和 Session 边界不能靠文件路径、包名或日期猜测 | [Golf Owner §2](../../golf.super/owner/ARCHITECTURE.md)；[身份任务 Review](../../golf.super/tasks/20261029-1604-20261029-1601-stabilize-importer-identity-and-remove-frontend-business-logic/Review.md)；MYSQL-06、TX-06 | **需要项目专属检测** | 用跨包重复、同键冲突、同日多 Session、移动/重命名/重新打包等 fixture 测试 ID 稳定性；同一键对应不同业务事实时必须 fail closed；未确认 Session 边界时保留歧义。 | **已有真实阻塞：** 2026-10-29 Review 重现了 Biomeca 相同 user+timestamp、不同 club 被静默合并；也重现同一 user 同一天两个时段被合成一个 Session。Review 结论为 NOT ACCEPTED。当前 Owner 明确 TrackMan 使用原生 GUID；Biomeca Record 使用 user_id + 原始精确时间；Biomeca Session 没有已确认的设备原生 ID，不能擅自按日期定义。现有 Product User identity 测试不等于覆盖设备记录身份。 |
| **17** | Device Fact / Native / Derived 与 Product User / Coach / Human Edit 必须分开，重导和重算不得覆盖人工数据 | [Golf Owner §3.2–3.3](../../golf.super/owner/ARCHITECTURE.md)；A-08；TX-06、TX-19 | **需要项目专属检测** | 检查表/字段 Owner 与允许写入路径；对重新导入、重新解析、Derived 重算前后做数据库快照比较，证明设备事实不被人工操作改写、人工 overlay 不被导入覆盖。 | Owner 已明确数据颜色和写入责任。Importer 的 `test_direct_persistence.py` 有 reimport 保留 ownership override 的测试；应继续覆盖 correction、audit、无设备目标时保留业务数据，以及设备重建后的稳定 ID 重新关联。 |
| **18** | 内部导入/计算走正式 CLI 和内部持久化路径，不为内部任务绕 HTTP API | A-06、A-07；Golf Owner §3.4 | **需要项目专属检测** | 架构测试检查 Internal 不依赖 API、API 不调用 Internal pipeline；CLI 导入在无 FastAPI/HTTP server 的情况下直接持久化；禁止保留第二套私有脚本入口。 | Importer 已有 `test_cli_contract.py`、`test_direct_persistence.py`、架构边界测试。Owner 已规定 `golf` 是正式操作入口；已有检查要继续证明真实 CLI 行为，不只检查命令名。 |
| **19** | 首次接入后，日常重建和重新解析优先使用 Importer 保存的 source-artifact 备份，不扫描 Raw/NAS | [Golf Owner §2、§4](../../golf.super/owner/ARCHITECTURE.md)；A-10；REL-20 | **需要项目专属检测** | 对正式 CLI 做隔离测试：备份对象存在时从备份读取并校验 SHA/长度；备份缺失时明确失败，不回退 Raw/NAS；普通重算只消费已保存 Native/Derived。 | **当前架构差距仍需解决：** Owner 的已知差距指出普通导入/重新解析仍可能扫描或回退外部 Raw。现有备份元数据和对象存储能力不等于“可从备份完整重建”已经验收。 |
| **20** | 数据库 schema 不得用 Trigger / Stored Procedure 隐藏业务逻辑；审计由应用显式写入 | [Golf Owner §3.3](../../golf.super/owner/ARCHITECTURE.md)；SEC-17 | **需要项目专属检测** | 通过数据库 schema introspection 检查零 trigger/procedure；扫描每个 migration，拒绝创建此类对象；测试审计记录与业务写入的原子性。 | 这是已发生的迁移违规：身份任务 Review 发现 migration 创建了 Owner 禁止的两个 audit triggers。当前 Importer 已有 `test_schema_colours.py`、`test_publication.py` 对 schema 和 migration 做检查；必须确保它们确实进入必需 CI，并覆盖未来 migration。 |

## 3. P1：收益高，但需要真实消费者、部署或运行证据

| # | 核心规则 | 来源 | 检测分类 | 自动检测方式 | 当前项目证据与边界 |
| --- | --- | --- | --- | --- | --- |
| **10** | API 契约机器可读，并与实际路由和响应一致 | REST-04、REST-18、REST-19 | **现成工具可直接检测** | 使用 OpenAPI validator、linter 和兼容性 diff 工具检查 Schema、operationId、breaking changes；另用项目测试核对实际路由、认证和响应。 | OpenAPI 文档本身通过校验，不代表生产入口已部署同样接口。现成工具只覆盖契约文件与兼容性，真实路由一致性仍需项目测试。 |
| **11** | 不增加无职责代理层；静态资源和大对象走正确的数据交付路径 | ARCH-05、ARCH-06、ARCH-07、REST-09、REST-13、OBJ-07；A-01、A-02 | **需要项目专属检测** | 检查部署路由；用浏览器记录真实请求目标，验证 API、静态文件、私有对象各走预期入口；确认大对象不是被 API 无意义读入再转发。 | Golf 已发生 JS 转发 API、静态资源和视频进入 Worker 的问题。当前 Importer 有 `test_deployment_boundary.py`，Workspace 有浏览器资源验收；必须看真实请求路径，不以仓库目录分离作为证据。 |
| **12** | 防止请求扇出和 N+1 随数据量放大 | REST-11、REST-12、REST-22、MYSQL-20；A-03、A-05、B-02、B-03 | **需要项目专属检测** | 固定真实页面 fixture，记录 HTTP、SQL、D1、R2 调用数与响应字节；比较不同数据规模下的增长趋势，识别每条记录额外查询。 | 对应单用户刷新数次即可触发 Worker 超限、单个列表 API 内部 N+1 等问题。先测真实训练详情路径，再依据实测基线设门槛，不发明“最多 N 个请求”。 |
| **13** | 发布验收必须覆盖真实关键用户路径，不能只看 Health 或 deploy 成功 | OBS-06、REL-16、REST-24；C-03、C-06 | **需要项目专属检测** | CI 验证隔离环境关键流程；部署后执行只读 Smoke Test，覆盖登录、认证态、关键 API、深链接、媒体/序列读取；报告明确哪些真实路径没有验证。 | Golf 曾出现 Health 正常但真实认证链路未验收。Importer 有 API 行为测试，Workspace 有浏览器 Smoke Test；生产 Smoke 必须只读，不能顺手修改真实业务数据。 |
| **14** | 一个生产目标只有明确发布责任；发布/批处理不能意外重复触发或耗尽额度 | REL-03、REL-19、ARCH-08；C-01、C-02 | **需要项目专属检测** | 对发布目标声明唯一 Owner；用 commit-pair / release identity 去重；对实际 provider 操作生成 plan，估算请求数、对象数和字节数，超过已知限制时停止。 | Golf 曾由两套 CI 对同一提交组合重复部署，也曾在发布中快速耗尽请求额度。concurrency 只串行，不等于去重。使用真实 Cloudflare 额度，不设跨平台固定数值。 |
| **15** | 外部调用必须有超时；重试必须有限且可安全重放 | TX-11、TX-13、REL-10、REL-11 | **需要项目专属检测** | 检查关键 HTTP/对象存储客户端配置；用模拟超时、429/5xx、永久失败验证总等待有界、尝试次数有限、非幂等写不被盲目重放。 | Importer 已有部分对象存储 timeout/retry 测试。避免 SDK、业务层、发布层多层叠加重试；超时值按调用预算和平台限制确定。 |
| **21** | 代码发布、D1 schema/migration/reset、R2 对象发布必须是可区分、可审计的操作 | OBJ-01、OBJ-02、REL-06、REL-09；A-09、C-01、C-02；[数据治理任务](../../golf.super/tasks/20261029-1837-govern-product-api-read-models-and-isolate-business-data/Task.md) | **需要项目专属检测** | 每次发布生成明确 change manifest：代码版本、D1 迁移/数据动作、R2 对象动作分别列出；执行前 dry-run，执行后比较 D1 schema 与 R2 对象 inventory/hash；未声明的资源变化必须失败。 | 当前任务明确要求生产只重建 D1 指定部分、R2 保持不动；这是一项本次发布目标，不是所有未来任务永远不能改 R2。常规代码发布不应隐式触发 R2 全量上传/删除；确需改对象时必须单独声明范围、成本和回滚。 |
| **22** | 发布索引、数据库引用和对象字节必须形成完整且同一代的闭环 | OBJ-11、OBJ-16、OBJ-18、REL-21；[历史 API/对象发布结果](../../golf.super/tasks/20261028-separate-workspace-frontend-api-and-fix-worker-overload/Result.md) | **需要项目专属检测** | 发布前验证每条对象引用都能解析；SHA-256、byte length 与真实对象一致；index 内所有资产属于同一 generation；缺对象时不签发可用下载 URL；失败发布不得切换 canonical pointer。 | 历史发布验证曾出现 `Mixed generations in published index`；Golf 生产曾出现 source-artifact 元数据存在但备份字节未发布、API 仍签发 URL 导致 404。**元数据存在不代表对象存在。** 这类检查应基于真实对象 inventory 和 manifest，不做昂贵的无界全桶扫描。 |
| **23** | Worker 计算资源与对象字节传输必须分离；媒体 Range/seek 必须端到端正确 | A-02、B-01、B-02、OBJ-07、REL-23；[Worker 资源修复结果](../../golf.super/tasks/20261028-separate-workspace-frontend-api-and-fix-worker-overload/Result.md) | **需要项目专属检测** | 浏览器测试 Range 请求 206、Content-Range、长度和 seek；检查 Worker 不绑定/流式转发大型对象；发布后关联 Worker CPU、subrequest、D1/R2 调用与真实路径。 | Golf 曾因 Python/Pyodide Worker 内部转换并流式转发大对象触发 1102；后续改为授权后浏览器直读对象并保留 Range。当前 `test_deployment_boundary.py` 已检查 Worker 签发对象读取凭证而不直接绑定/流式对象。不要把某个 Worker CPU 数字推广成所有平台阈值。 |
| **25** | 同一原始 snapshot 只解码一次，多个 Derived producer 共享解析结果 | ARCH-03、REST-22、REL-23；Golf Owner §3 | **需要项目专属检测** | 在测试中 instrument 解码入口，验证每个 source snapshot 每次导入只解码一次；多个 producer 消费同一份已解析状态；对输入规模记录 CPU/内存和重复读取。 | 过去代码审查发现多个 Biomeca producer 各自重复 parse、找 snapshot、解包和 unpickle；当前 Owner 已明确统一导入共享解码，不引入事件总线、插件框架或 DAG。 |

## 4. Agent Review 与不值得自动化：不能伪装成确定性门禁

以下判断需要 Agent 结合 Owner、真实数据、产品目标和可观察结果进行审查。可以要求 Review 提供引用、查询结果、测试或运行证据，但不能只凭规则关键词判定通过。

| # | 审查主题 | 检测分类 | Review 必须回答 |
| --- | --- | --- | --- |
| **24** | 设备来源数据的已知语义异常必须保留、暴露，不得静默合并或伪造正常业务实体 | **Agent Review** | 对新异常先对照 Owner、来源字段和业务事实判断；确认语义后，将已知情况固化为 fixture / schema / 状态测试。历史样本包括别名与独立主体冲突、非球员组织名被当学员、文件名日期与内部日期冲突、零数据主体仍生成误导性报告。不得把具体人名或字符串硬编码成特殊分支。 |
| **26** | 产品 API 使用稳定领域概念，不暴露数据库表、producer、Lab 毕业顺序或对象存储实现 | **Agent Review** | 对照 Owner 和真实消费者审查 API 资源、字段与行为；确认后用 OpenAPI contract tests 锁定已批准的资源与字段。Golf 已明确 User / Session、TrackMan Shot、Biomeca Record 等领域语义；Schema 工具不能独立判断资源是否符合真实业务概念。 |
| **27** | 业务常识、物理合理性和产品结果是否成立 | **Agent Review** | 单位/数量级是否可能；缺失值是否被伪造成 0；数据冲突是否被静默合并；统计结果是否会误导教练。已有明确的领域边界应转成测试，未知语义先暴露，不猜测。 |
| **28** | 架构选择是否真的解决问题，是否引入不必要复杂度 | **不值得自动化** | 是否真的需要缓存、消息队列、微服务、物化汇总或额外抽象？是否有真实消费者、负载或故障证据？不要用关键词扫描和固定模板代替取舍。 |
| **29** | 性能阈值是否有依据 | **不值得自动化** | 数字是否来自用户要求、平台硬限制、SLO 或实测基线？没有来源的统一请求数、毫秒数、并发数不进入 CI 门禁。可以检查阈值是否有出处，但不自动决定业务阈值本身。 |

## 5. 暂不进入机器门禁

- **MySQL 专属优化**：Golf 当前主要涉及 SQLite/D1；InnoDB、聚簇索引等不能不加区分地套用。跨数据库适用的唯一约束、事务、迁移和查询边界仍保留。
- **缓存与消息队列**：没有实测瓶颈或真实异步需求时，不为所有项目增加基础设施。先修请求拓扑、N+1、无界查询和对象传输。
- **微服务、Service Mesh、通用规则引擎**：不为抽象的“可扩展性”预先建设；先复用模块边界、CLI、CI 和平台能力。
- **统一性能数字**：不得把某个 Cloudflare Worker、D1 或 R2 配额变成跨平台通用阈值。
- **仅靠 LLM 判断的规则**：可以做语义 Review，但不能独立充当硬门禁；需要将已确认的具体不变量继续转成测试。

## 6. 当前落地状态与下一步

### 已有、应复用的检查

- 模块边界：`tests/architecture/test_internal_api_boundary.py`、`test_capability_boundaries.py`。
- Schema 所有权、跨颜色外键、Trigger/Procedure：`tests/architecture/test_schema_colours.py`、`tests/test_publication.py`。
- 正式 CLI 和直接持久化：`tests/architecture/test_cli_contract.py`、`tests/test_direct_persistence.py`。
- API 认证、分页和错误行为：`tests/api/test_auth.py`、`test_read_routes.py`。
- 对象发布清单、备份排除、缺对象检查：`tests/test_publication.py`、`tests/api/test_deployment_boundary.py`。
- 身份与重复导入：`tests/test_identity.py`、`tests/test_direct_persistence.py`，但**不能据此宣称第 16 组已通过**；2026-10-29 Review 已重现记录冲突与 Session 合并问题。

### 尚需优先补齐或重新验收

1. **先处理第 16 组的两个已复现问题**：不同业务事实的稳定键冲突必须 fail closed；Biomeca Session 不能未经证明按自然日合并。
2. **确认第 20 组检查进入必需 CI**：迁移 SQL 和最终 schema 都必须拒绝 Trigger/Procedure。
3. **验证第 17 组真实数据行为**：重导、重算、设备重建前后，设备事实与人工 overlay 分别保持其 Owner。
4. **补齐第 19 组恢复能力**：证明从 Importer 已保存 source-artifact 备份重新解析可用；缺失时明确失败，不访问 Raw/NAS。当前 Owner 已记录此处仍有实现差距。
5. **按第 21 组完成本次 D1/R2 生产变更边界**：先审 plan 和资源清单；生产 D1 操作不能隐式修改 R2。R2 零变化是本次目标，不是跳过本地实施的前置条件。
6. **补齐第 22、23、25 组的真实证据**：对象引用闭环、generation 一致性、Range/seek、Worker 资源关联，以及每个 snapshot 只解码一次。
7. **把第 24、26、27 组的 Review 结论沉淀为明确的业务状态和回归 fixture**，不要把 Agent 的一次性判断留在对话里。

### 验收原则

- 每个项目专属检测都必须有**违规样例**和**合法样例**：错误输入会被阻止，正常业务仍然能完成。
- 检查缺失、未运行、证据过期和真实失败必须区分；缺少证据不能报告“通过”。
- 静态检查、单元测试、隔离集成测试、真实部署 Smoke Test 是不同证据层，不能互相替代。
- 对生产 D1/R2 的破坏性动作，必须先核实目标资源、变更清单、数据保护和恢复方式；文档或 dry-run 本身不等于执行成功。
- 先修正已有检查器的覆盖缺口，再考虑新增检测器；不为每条规则造一个独立工具。

**本文件是规则筛选和检测分类，不代表所有检查已经实现或通过。当前最明确的事实是：我们已经有不少项目专属门禁，但它们仍存在漏测、未覆盖真实语义和未完成端到端验收的情况。**
