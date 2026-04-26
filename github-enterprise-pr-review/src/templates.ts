import type { Lang } from "./i18n.js";
import type { LanguageTemplate } from "./types.js";

interface TemplateDefinition {
  prompt: {
    zh: string;
    en: string;
  };
  checklist: {
    zh: string[];
    en: string[];
  };
}

const BASE_CHECKLIST_ZH = ["代码质量和可读性", "性能优化建议", "安全性检查", "设计模式和架构合理性", "测试覆盖率评估", "命名规范和代码风格", "错误处理机制", "依赖管理合理性", "文档完整性"];

const BASE_CHECKLIST_EN = [
  "Code quality and readability",
  "Performance optimization guidance",
  "Security checks",
  "Architecture and design suitability",
  "Test coverage assessment",
  "Naming and coding style",
  "Error handling strategy",
  "Dependency management",
  "Documentation completeness"
];

const FRONTEND_REVIEW_PROMPT = `以下为前端开发评审模板（可直接作为评审任务清单）:

| 检查大项 | 细项 | 评审要点 | 通过标准 | 常见缺陷 | 改进建议 | 责任人 | 完成时限 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| React 组件设计 | 组件职责拆分 | 单一职责、Props 边界、复用性与可测试性 | 单组件圈复杂度 <= 10，Props 必填项有类型约束 | 超大组件、隐式依赖、Props drilling 风险 | 拆分容器/展示组件，引入 hooks 复用逻辑 | 前端开发 | PR 合并前 |
| 性能优化 | 渲染与资源加载 | 避免不必要重渲染、懒加载、代码分割、缓存策略 | Core Web Vitals: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 | 频繁重渲染、首屏阻塞、包体过大 | 使用 memo/useMemo/useCallback、路由级拆包、图片压缩 | 前端开发 | PR 合并前 |
| 可访问性 | 语义化与键盘可达 | ARIA、语义标签、焦点管理、对比度 | axe 扫描严重级问题 = 0，键盘可完成核心路径 | div 按钮、缺失 aria-label、焦点丢失 | 使用语义标签和可访问组件库，补充无障碍测试 | 前端开发/QA | 提测前 |
| 浏览器兼容性 | 主流浏览器行为一致 | 新特性降级、polyfill、CSS 前缀策略 | Chrome/Firefox/Safari 最新两个大版本通过率 = 100% | Safari 样式错位、API 不兼容 | 配置 Browserslist 与自动 polyfill，补兼容测试用例 | 前端开发 | 提测前 |
| 响应式布局 | 多断点适配 | 栅格、媒体查询、移动优先、横竖屏 | 360px/768px/1024px/1440px 关键页面无布局溢出 | 固定宽度、文字截断、弹窗越界 | 采用流式布局与 design tokens，增加视觉回归测试 | 前端开发/设计 | 提测前 |
| 状态管理 | 状态边界与一致性 | 本地/全局状态分层、副作用隔离、不可变更新 | 无循环依赖；状态变更路径可追踪；竞态缺陷 = 0 | 状态污染、重复请求、竞态覆盖 | 引入状态机或 query cache，统一异步状态流 | 前端开发 | PR 合并前 |
| 代码规范 | 静态检查与风格一致 | ESLint/Prettier/TypeScript strict | lint error = 0，TypeScript error = 0，关键规则无跳过 | 禁用规则滥用、any 泛滥 | 开启 strict 模式，补充自定义 lint 规则 | 前端开发 | PR 合并前 |
| 单元测试覆盖率 | 组件与逻辑测试 | 渲染、交互、边界、异常分支覆盖 | 行覆盖率 >= 80%，核心模块分支覆盖率 >= 70% | 仅快照测试、缺少边界用例 | 增加 React Testing Library 行为测试与 mock 场景 | 前端开发/QA | 提测前 |
| 构建配置 | 打包与发布参数 | Tree-shaking、source map、环境变量隔离 | 生产包体较基线增长 <= 10%，无敏感变量注入 | source map 泄露、构建漂移 | 固化构建参数，启用 bundle analyzer 与预算阈值 | 前端开发/DevOps | 发布前 |
| SEO 优化 | 索引与元信息 | SSR/SSG、meta、结构化数据、站点地图 | Lighthouse SEO >= 90，关键页 metadata 完整率 = 100% | 重复 title、缺 canonical、首屏无内容 | 引入 SEO 组件约束，CI 增加 SEO 门禁 | 前端开发/运营 | 发布前 |

Jira/Azure DevOps 一键导入建议（CSV UTF-8）:
\`\`\`csv
Work Item Type,Title,Description,Assigned To,Due Date,Tags,Priority
Task,[FE] React 组件设计评审,检查单一职责/复用性/可测试性并记录缺陷,frontend-owner,2026-04-30,review;frontend,2
Task,[FE] 性能优化评审,核验 Core Web Vitals 与包体预算阈值,frontend-owner,2026-04-30,review;frontend;performance,1
Task,[FE] 可访问性评审,执行 axe 扫描并修复严重问题,qa-owner,2026-04-30,review;frontend;a11y,1
\`\`\`
`;

const FRONTEND_REVIEW_PROMPT_EN = `Below is the frontend review template (ready for review task execution):

| Category | Sub-item | Review Focus | Pass Criteria | Common Defects | Improvement Suggestions | Owner | Due Time |
| --- | --- | --- | --- | --- | --- | --- | --- |
| React Component Design | Responsibility split | SRP, props boundary, reusability, testability | Component complexity <= 10 and required props are typed | God components, hidden coupling, props drilling | Split container/presentational components and extract hooks | Frontend Engineer | Before merge |
| Performance | Rendering and loading | Avoid unnecessary re-renders, lazy load, code split | Core Web Vitals: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 | Re-render loops, blocked first paint, large bundles | Use memo/useMemo/useCallback and route-level splitting | Frontend Engineer | Before merge |
| Accessibility | Semantics and keyboard support | ARIA, semantic tags, focus management, contrast | axe severe issues = 0 and keyboard path is complete | Clickable div, missing aria-label, focus loss | Use semantic components and a11y regression checks | Frontend/QA | Before test |
| Browser Compatibility | Cross-browser consistency | Polyfills, graceful degradation, CSS prefixing | 100% pass on latest 2 major versions of Chrome/Firefox/Safari | Safari layout issues, unsupported APIs | Maintain Browserslist and compatibility test cases | Frontend Engineer | Before test |
| Responsive Layout | Multi-breakpoint adaptation | Grid, media query, mobile-first | No overflow on 360/768/1024/1440 breakpoints | Fixed width, text clipping, modal overflow | Use fluid layout and visual regression checks | Frontend/Design | Before test |
| State Management | Boundary and consistency | Local/global layering, side effect isolation | No cyclic dependency, traceable state changes, race defects = 0 | State pollution, duplicate requests | Introduce state machine or query cache | Frontend Engineer | Before merge |
| Code Standards | Static quality gates | ESLint/Prettier/TypeScript strict | lint errors = 0, TS errors = 0 | Disabled rules, excessive any usage | Enforce strict mode and custom rules | Frontend Engineer | Before merge |
| Unit Test Coverage | Behavior and edge cases | Render/interaction/edge/error branches | Line coverage >= 80%, core branch coverage >= 70% | Snapshot-only tests, missing edge cases | Add behavior tests with React Testing Library | Frontend/QA | Before test |
| Build Config | Packaging and runtime config | Tree-shaking, sourcemap, env isolation | Production bundle growth <= 10%, no secret leakage | Source map leak, unstable build params | Add bundle analyzer and budget gates | Frontend/DevOps | Before release |
| SEO | Discoverability and metadata | SSR/SSG, metadata, structured data, sitemap | Lighthouse SEO >= 90 and metadata completeness = 100% | Duplicate title, missing canonical | Add SEO guardrails in CI | Frontend/Content | Before release |

Jira/Azure DevOps one-click import suggestion (CSV UTF-8):
\`\`\`csv
Work Item Type,Title,Description,Assigned To,Due Date,Tags,Priority
Task,[FE] React component review,Validate responsibility/reusability/testability and log defects,frontend-owner,2026-04-30,review;frontend,2
Task,[FE] Performance review,Validate Core Web Vitals and bundle budget thresholds,frontend-owner,2026-04-30,review;frontend;performance,1
Task,[FE] Accessibility review,Run axe scan and fix severe issues,qa-owner,2026-04-30,review;frontend;a11y,1
\`\`\`
`;

const BACKEND_REVIEW_PROMPT = `以下为后端开发评审模板（含可量化验收指标）:

| 检查大项 | 细项 | 评审要点 | 通过标准 | 常见缺陷 | 改进建议 | 责任人 | 完成时限 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| API 设计规范 | 资源与语义 | REST/GraphQL 语义一致、幂等、版本管理 | OpenAPI 校验通过率 = 100%，破坏性变更 = 0 | URI/动词混乱、错误码不统一 | 建立 API 评审网关与变更检查清单 | 后端开发/架构师 | PR 合并前 |
| 数据库索引与事务 | 索引命中与一致性 | 慢查询、事务边界、隔离级别 | P95 SQL < 100ms，慢查询占比 < 1%，死锁 = 0 | 全表扫描、长事务、索引失效 | 建立索引评审模板，拆分长事务 | 后端开发/DBA | 提测前 |
| 缓存策略 | 命中率与一致性 | key 设计、TTL、失效策略、防击穿 | 缓存命中率 >= 85%，穿透/击穿告警 = 0 | 热点 key、脏读、缓存雪崩 | 加互斥锁/布隆过滤器，分级缓存 | 后端开发 | 提测前 |
| 异常处理 | 错误分层与可追踪 | 统一异常码、上下文透传、降级策略 | 未捕获异常 = 0，5xx 比例 < 0.5% | 吞异常、错误信息泄露 | 统一异常中间件，补充失败注入测试 | 后端开发 | PR 合并前 |
| 日志规范 | 结构化与审计 | traceId、字段脱敏、日志级别 | 关键链路 trace 覆盖率 = 100%，敏感字段泄露 = 0 | 无 traceId、明文密码 | 统一日志 SDK，启用脱敏规则 | 后端开发/安全 | 提测前 |
| 安全漏洞 | 鉴权与输入校验 | SQL 注入、XSS、SSRF、越权校验 | SAST 高危 = 0，DAST 高危 = 0，鉴权绕过 = 0 | 拼接 SQL、缺 token 校验 | 参数化查询 + WAF + 统一鉴权中间件 | 后端开发/安全 | 发布前 |
| 并发性能 | 线程模型与限流 | 锁粒度、连接池、背压与熔断 | 压测 P99 < 300ms，错误率 < 0.1%，CPU < 70% | 锁竞争、线程池耗尽 | 优化锁策略，引入限流熔断组件 | 后端开发/SRE | 发布前 |
| 单元/集成/契约测试 | 多层测试覆盖 | 业务逻辑、外部依赖、契约一致性 | 单测覆盖率 >= 80%，集成关键链路通过率 = 100%，契约破坏 = 0 | 只测 Happy Path、契约漂移 | 增加异常与边界场景，接入契约测试门禁 | 后端开发/QA | 提测前 |
| 容器化配置 | 镜像与运行参数 | 最小镜像、探针、资源限制、只读根文件系统 | 镜像高危漏洞 = 0，启动成功率 = 100% | root 运行、无资源限制 | 使用 distroless + 非 root + 限额策略 | 后端开发/DevOps | 发布前 |
| CI/CD 流水线 | 自动化与门禁 | 编译、测试、扫描、制品签名 | 主干流水线成功率 >= 95%，失败回滚时间 <= 10min | 手工发布、门禁缺失 | 增加质量门禁与自动回滚步骤 | DevOps/后端开发 | 发布前 |
| 监控告警 | 指标与阈值 | RED/USE 指标、错误预算、告警收敛 | 关键 SLI 覆盖率 = 100%，告警误报率 < 10% | 无业务指标、告警风暴 | 分级告警与自愈脚本，补链路追踪 | SRE/后端开发 | 发布前 |
| 灰度发布与回滚策略 | 风险控制 | 金丝雀比例、自动回滚条件、数据兼容 | 灰度失败自动回滚 <= 5min，用户影响面 < 5% | 一次性全量、回滚脚本缺失 | 制定灰度剧本，双写或向后兼容迁移 | DevOps/后端开发 | 发布前 |

Jira/Azure DevOps 一键导入建议（CSV UTF-8）:
\`\`\`csv
Work Item Type,Title,Description,Assigned To,Due Date,Tags,Priority
Task,[BE] API 设计规范评审,校验 OpenAPI/错误码/幂等性并输出结论,backend-owner,2026-04-30,review;backend;api,1
Task,[BE] 数据库与事务评审,验证索引命中率/慢查询/死锁指标,backend-owner,2026-04-30,review;backend;db,1
Task,[BE] 测试与发布门禁评审,核验单测/集成/契约覆盖及回滚策略,qa-owner,2026-04-30,review;backend;quality,1
\`\`\`
`;

const BACKEND_REVIEW_PROMPT_EN = `Below is the backend review template (with measurable acceptance indicators):

| Category | Sub-item | Review Focus | Pass Criteria | Common Defects | Improvement Suggestions | Owner | Due Time |
| --- | --- | --- | --- | --- | --- | --- | --- |
| API Design | Resource semantics | REST/GraphQL semantics, idempotency, versioning | OpenAPI validation pass rate = 100%, breaking change = 0 | Inconsistent URI/verbs, error code drift | Add API governance checklist and review gate | Backend/Architect | Before merge |
| DB Index and Transaction | Query and consistency | Slow query, transaction boundaries, isolation level | P95 SQL < 100ms, slow query ratio < 1%, deadlock = 0 | Full scans, long transactions, index miss | Add index review template and split long transactions | Backend/DBA | Before test |
| Cache Strategy | Hit ratio and consistency | key design, TTL, invalidation, anti-stampede | Cache hit ratio >= 85%, stampede alerts = 0 | Hot keys, stale data, avalanche | Add lock + bloom filter + tiered cache | Backend Engineer | Before test |
| Exception Handling | Error taxonomy | unified error code, context propagation, fallback | Unhandled exception = 0, 5xx ratio < 0.5% | Swallowed exceptions, sensitive leakage | Introduce centralized exception middleware | Backend Engineer | Before merge |
| Logging Standard | Structured logs and auditability | traceId, masking, level policy | Trace coverage on key path = 100%, secret leakage = 0 | Missing traceId, plain text secrets | Use unified logging SDK and masking policy | Backend/Security | Before test |
| Security | AuthN/AuthZ and input validation | SQLi/XSS/SSRF/privilege check | SAST high risk = 0, DAST high risk = 0 | SQL string concat, missing auth checks | Parameterized query + WAF + auth middleware | Backend/Security | Before release |
| Concurrency Performance | Resource and throughput | lock granularity, pool sizing, circuit breaker | P99 < 300ms, error rate < 0.1%, CPU < 70% | Lock contention, pool exhaustion | Introduce flow control and breaker components | Backend/SRE | Before release |
| Unit/Integration/Contract Tests | Multi-layer coverage | logic, dependency integration, contract consistency | Unit >= 80%, key integration pass = 100%, contract break = 0 | Happy-path only, contract drift | Add boundary/failure test scenarios | Backend/QA | Before test |
| Container Config | Runtime hardening | minimal image, probes, limits, readonly fs | High/Critical image vulnerability = 0 | Root user, no limits | Use distroless + non-root + resource limits | Backend/DevOps | Before release |
| CI/CD Pipeline | Automation and quality gates | build/test/scan/signing/release | Main pipeline success >= 95%, rollback <= 10 min | Manual release, missing gates | Add mandatory quality gates and auto-rollback | DevOps/Backend | Before release |
| Monitoring and Alerting | SLI/SLO and alert quality | RED/USE metrics, error budget, noise control | Key SLI coverage = 100%, false alert rate < 10% | No business metrics, alert storms | Add layered alerts and self-healing actions | SRE/Backend | Before release |
| Canary and Rollback | Progressive delivery risk control | canary ratio, rollback trigger, schema compatibility | Auto rollback <= 5 min and impacted users < 5% | One-shot full rollout, no rollback script | Add rollout playbook and compatibility strategy | DevOps/Backend | Before release |

Jira/Azure DevOps one-click import suggestion (CSV UTF-8):
\`\`\`csv
Work Item Type,Title,Description,Assigned To,Due Date,Tags,Priority
Task,[BE] API design review,Validate OpenAPI/error code/idempotency and output findings,backend-owner,2026-04-30,review;backend;api,1
Task,[BE] DB and transaction review,Validate index hit ratio/slow query/deadlock metrics,backend-owner,2026-04-30,review;backend;db,1
Task,[BE] Test and release gate review,Validate unit/integration/contract coverage and rollback strategy,qa-owner,2026-04-30,review;backend;quality,1
\`\`\`
`;

const DEVOPS_REVIEW_PROMPT = `以下为 DevOps 评审模板（含脚本示例与失败阈值）:

| 检查大项 | 细项 | 评审要点 | 通过标准 | 常见缺陷 | 改进建议 | 责任人 | 完成时限 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| IaC 合规性 | Terraform/Helm 规范 | 命令示例: \`terraform fmt -check && terraform validate\` | 校验失败数 = 0；未审批变更 = 0 | 硬编码配置、漂移未治理 | 增加 pre-commit 与 plan 审批门禁 | DevOps | PR 合并前 |
| Kubernetes 配额与网络策略 | 资源与隔离 | 命令示例: \`kubectl describe quota -n prod\`、\`kubectl get netpol -A\` | 无无限制命名空间；默认拒绝策略覆盖率 = 100% | 无配额导致抢占、网络全开放 | 为每命名空间设置 quota/limitrange 与 netpol | DevOps/SRE | 提测前 |
| 镜像安全扫描 | 漏洞治理 | 命令示例: \`trivy image --exit-code 1 app:tag\` | Critical/High 漏洞 = 0 | 基础镜像过旧、未签名镜像 | 固定基础镜像版本并接入镜像签名 | DevSecOps | PR 合并前 |
| 密钥管理 | 凭据生命周期 | 命令示例: \`gitleaks detect\`、\`kubeseal --validate\` | 明文密钥提交 = 0；过期密钥比例 = 0% | 密钥写入 Git、长期不轮换 | 使用 Vault/KMS，启用自动轮换策略 | 安全/DevOps | 发布前 |
| 成本优化 | 资源利用率 | 命令示例: \`kubectl top pod -A\`、\`infracost breakdown --path .\` | 月成本增幅 <= 10%；空闲资源占比 < 15% | over-provision、闲置节点 | 启用 HPA/VPA 与关停策略 | FinOps/DevOps | 每周 |
| SLA/SLO 定义 | 服务目标 | 命令示例: \`promtool test rules slo_rules.yml\` | 核心服务 SLO 定义覆盖率 = 100%；错误预算可追踪 | 仅有 SLA 无 SLO、阈值不可观测 | 以用户旅程定义 SLI 并绑定告警 | SRE/产品 | 发布前 |
| 可观测性 | 指标/链路/日志 | 命令示例: \`otelcol --config otel.yaml --dry-run\` | 指标/日志/链路三栈覆盖率 = 100%；关键 trace 采样率 >= 95% | 指标孤岛、trace 断链 | 统一遥测规范与 traceId 透传 | SRE/后端开发 | 提测前 |
| 自动化测试门禁 | 质量关卡 | 命令示例: \`npm test && newman run contract.json\` | 阻断级测试失败数 = 0；门禁绕过 = 0 | 手工跳过测试、假绿流水线 | 保护主干分支并启用必过检查 | DevOps/QA | PR 合并前 |
| 蓝绿/金丝雀发布 | 渐进式交付 | 命令示例: \`kubectl argo rollouts set image\` | 金丝雀阶段失败率 > 1% 自动回滚；扩容步长 <= 25% | 一次性全量、无自动回滚 | 使用 Argo Rollouts 并配置分析模板 | DevOps/SRE | 发布前 |
| 灾备演练 | RTO/RPO 验证 | 命令示例: \`velero backup create\`、\`chaos-mesh\` 故障注入 | RTO <= 30min，RPO <= 5min，季度演练完成率 = 100% | 备份不可恢复、演练流于形式 | 建立演练剧本并复盘整改 | SRE/DBA | 每季度 |
| 变更审计 | 可追溯性 | 命令示例: \`kubectl get events -A\`、审计日志检索 | 生产变更审计覆盖率 = 100%；未授权变更 = 0 | 变更无工单、审批链缺失 | 变更必须绑定工单与审批记录 | DevOps/审计 | 发布前 |
| 合规基线扫描 | 标准符合性 | 命令示例: \`kube-bench run --targets master,node\`、\`kube-score score\` | CIS 高危不合规项 = 0；中危 <= 3 且有豁免 | 仅一次性扫描、豁免无到期 | 将基线扫描纳入夜间流水线并跟踪到期 | DevSecOps | 每周 |

Jira/Azure DevOps 一键导入建议（CSV UTF-8）:
\`\`\`csv
Work Item Type,Title,Description,Assigned To,Due Date,Tags,Priority
Task,[Ops] IaC 合规评审,执行 terraform/helm 校验并阻断不合规变更,devops-owner,2026-04-30,review;devops;iac,1
Task,[Ops] K8s 与镜像安全评审,核验配额/netpol 与镜像漏洞阈值,devsecops-owner,2026-04-30,review;devops;security,1
Task,[Ops] 可观测性与发布策略评审,检查 SLO/告警/蓝绿金丝雀与回滚脚本,sre-owner,2026-04-30,review;devops;reliability,1
\`\`\`
`;

const DEVOPS_REVIEW_PROMPT_EN = `Below is the DevOps review template (with command examples and failure thresholds):

| Category | Sub-item | Review Focus | Pass Criteria | Common Defects | Improvement Suggestions | Owner | Due Time |
| --- | --- | --- | --- | --- | --- | --- | --- |
| IaC Compliance | Terraform/Helm quality | Example: \`terraform fmt -check && terraform validate\` | Validation failures = 0 and unapproved drift = 0 | Hard-coded config, unmanaged drift | Add pre-commit and plan approval gates | DevOps | Before merge |
| Kubernetes Quota and NetPolicy | Resource and isolation | Example: \`kubectl describe quota -n prod\`, \`kubectl get netpol -A\` | No unlimited namespace and deny-by-default coverage = 100% | Missing quota, over-open network | Add quota/limitrange/netpol baseline per namespace | DevOps/SRE | Before test |
| Image Security Scan | Vulnerability control | Example: \`trivy image --exit-code 1 app:tag\` | Critical/High vulnerability = 0 | Outdated base image, unsigned image | Pin base image and enforce image signing | DevSecOps | Before merge |
| Secret Management | Secret lifecycle | Example: \`gitleaks detect\`, \`kubeseal --validate\` | Plain secret commit = 0 and expired key ratio = 0% | Secret in git, no key rotation | Use Vault/KMS and automated rotation | Security/DevOps | Before release |
| Cost Optimization | Utilization governance | Example: \`kubectl top pod -A\`, \`infracost breakdown --path .\` | Monthly cost increase <= 10%, idle resource ratio < 15% | Over-provisioning, idle nodes | Enable HPA/VPA and schedule shutdown policy | FinOps/DevOps | Weekly |
| SLA/SLO Definition | Reliability targeting | Example: \`promtool test rules slo_rules.yml\` | SLO coverage on core services = 100% | SLA exists but no measurable SLO | Build user-journey SLI with alert linkage | SRE/Product | Before release |
| Observability | Metrics/trace/logging | Example: \`otelcol --config otel.yaml --dry-run\` | Full telemetry coverage and key trace sampling >= 95% | Broken trace, siloed metrics | Standardize telemetry spec and trace propagation | SRE/Backend | Before test |
| Automated Test Gates | Pipeline quality gate | Example: \`npm test && newman run contract.json\` | Blocking test failures = 0 and gate bypass = 0 | Manual bypass, false green pipeline | Protect trunk branch and required checks | DevOps/QA | Before merge |
| Blue-Green/Canary | Progressive rollout | Example: \`kubectl argo rollouts set image\` | Auto rollback when canary failure > 1% | Full rollout at once, no rollback condition | Adopt Argo Rollouts with analysis template | DevOps/SRE | Before release |
| DR Drill | RTO/RPO validation | Example: \`velero backup create\`, chaos test injection | RTO <= 30 min, RPO <= 5 min, quarterly drill = 100% | Backup not restorable, no drill replay | Build drill runbook and remediation follow-up | SRE/DBA | Quarterly |
| Change Audit | Traceability and approval | Example: \`kubectl get events -A\` and audit log query | Production change audit coverage = 100% | No linked ticket, broken approval chain | Enforce ticket + approval linkage | DevOps/Audit | Before release |
| Compliance Baseline Scan | Control baseline | Example: \`kube-bench run --targets master,node\`, \`kube-score score\` | CIS high-risk noncompliance = 0 | One-off scan only, unmanaged waiver | Add nightly baseline scan and waiver expiration tracking | DevSecOps | Weekly |

Jira/Azure DevOps one-click import suggestion (CSV UTF-8):
\`\`\`csv
Work Item Type,Title,Description,Assigned To,Due Date,Tags,Priority
Task,[Ops] IaC compliance review,Run terraform/helm checks and block non-compliant changes,devops-owner,2026-04-30,review;devops;iac,1
Task,[Ops] K8s and image security review,Validate quota/netpol and image vulnerability thresholds,devsecops-owner,2026-04-30,review;devops;security,1
Task,[Ops] Observability and rollout review,Validate SLO/alerts/canary rollback scripts,sre-owner,2026-04-30,review;devops;reliability,1
\`\`\`
`;

const TEMPLATE_DEFINITIONS: Record<string, TemplateDefinition> = {
  TypeScript: {
    prompt: {
      zh: "重点检查类型定义完整性、any 滥用、异步错误处理、API 类型契约一致性。",
      en: "Focus on complete typing, avoiding any abuse, async error handling, and API type contract consistency."
    },
    checklist: {
      zh: BASE_CHECKLIST_ZH,
      en: BASE_CHECKLIST_EN
    }
  },
  JavaScript: {
    prompt: {
      zh: "重点检查异步流程、边界处理、原型污染风险、运行时类型校验。",
      en: "Focus on async flow correctness, boundary handling, prototype pollution risk, and runtime validation."
    },
    checklist: {
      zh: BASE_CHECKLIST_ZH,
      en: BASE_CHECKLIST_EN
    }
  },
  Python: {
    prompt: {
      zh: "重点检查异常捕获粒度、上下文管理、性能热点、PEP8 风格一致性。",
      en: "Focus on exception granularity, context management, performance hotspots, and PEP8 consistency."
    },
    checklist: {
      zh: BASE_CHECKLIST_ZH,
      en: BASE_CHECKLIST_EN
    }
  },
  Java: {
    prompt: {
      zh: "重点检查并发安全、空指针风险、面向对象设计、依赖注入边界。",
      en: "Focus on concurrency safety, null risks, OO design quality, and DI boundaries."
    },
    checklist: {
      zh: BASE_CHECKLIST_ZH,
      en: BASE_CHECKLIST_EN
    }
  },
  Go: {
    prompt: {
      zh: "重点检查 error 处理、goroutine 生命周期、context 传播和资源回收。",
      en: "Focus on error handling, goroutine lifecycle, context propagation, and resource cleanup."
    },
    checklist: {
      zh: BASE_CHECKLIST_ZH,
      en: BASE_CHECKLIST_EN
    }
  },
  "C++": {
    prompt: {
      zh: "重点检查内存管理、RAII 使用、未定义行为风险、异常安全与拷贝语义。",
      en: "Focus on memory management, RAII usage, undefined behavior risks, exception safety, and copy semantics."
    },
    checklist: {
      zh: BASE_CHECKLIST_ZH,
      en: BASE_CHECKLIST_EN
    }
  },
  "Frontend Review": {
    prompt: {
      zh: FRONTEND_REVIEW_PROMPT,
      en: FRONTEND_REVIEW_PROMPT_EN
    },
    checklist: {
      zh: ["React 组件设计", "性能优化", "可访问性", "浏览器兼容性", "响应式布局", "状态管理", "代码规范", "单元测试覆盖率", "构建配置", "SEO 优化"],
      en: [
        "React component design",
        "Performance optimization",
        "Accessibility",
        "Browser compatibility",
        "Responsive layout",
        "State management",
        "Code standards",
        "Unit test coverage",
        "Build configuration",
        "SEO optimization"
      ]
    }
  },
  "Backend Review": {
    prompt: {
      zh: BACKEND_REVIEW_PROMPT,
      en: BACKEND_REVIEW_PROMPT_EN
    },
    checklist: {
      zh: ["API 设计规范", "数据库索引与事务", "缓存策略", "异常处理", "日志规范", "安全漏洞", "并发性能", "单元/集成/契约测试", "容器化配置", "CI/CD 流水线", "监控告警", "灰度发布回滚策略"],
      en: [
        "API design standard",
        "DB index and transaction",
        "Cache strategy",
        "Exception handling",
        "Logging standard",
        "Security vulnerabilities",
        "Concurrency performance",
        "Unit/integration/contract tests",
        "Container configuration",
        "CI/CD pipeline",
        "Monitoring and alerting",
        "Canary and rollback strategy"
      ]
    }
  },
  "DevOps Review": {
    prompt: {
      zh: DEVOPS_REVIEW_PROMPT,
      en: DEVOPS_REVIEW_PROMPT_EN
    },
    checklist: {
      zh: ["IaC 合规性", "Kubernetes 资源配额与网络策略", "镜像安全扫描", "密钥管理", "成本优化", "SLA/SLO 定义", "可观测性", "自动化测试门禁", "蓝绿/金丝雀发布", "灾备演练", "变更审计", "合规基线扫描"],
      en: [
        "IaC compliance",
        "Kubernetes quota and network policy",
        "Image security scan",
        "Secret management",
        "Cost optimization",
        "SLA/SLO definition",
        "Observability",
        "Automated test gate",
        "Blue-green/canary release",
        "Disaster recovery drill",
        "Change audit",
        "Compliance baseline scan"
      ]
    }
  }
};

export function getLanguageTemplates(lang: Lang = "en"): LanguageTemplate[] {
  return Object.entries(TEMPLATE_DEFINITIONS).map(([language, definition]) => ({
    language,
    prompt: definition.prompt[lang],
    checklist: definition.checklist[lang]
  }));
}

export function detectLanguageFromFile(filename: string): string {
  if (filename.endsWith(".ts") || filename.endsWith(".tsx")) {
    return "TypeScript";
  }
  if (filename.endsWith(".js") || filename.endsWith(".jsx")) {
    return "JavaScript";
  }
  if (filename.endsWith(".py")) {
    return "Python";
  }
  if (filename.endsWith(".java")) {
    return "Java";
  }
  if (filename.endsWith(".go")) {
    return "Go";
  }
  if (filename.endsWith(".cpp") || filename.endsWith(".cc") || filename.endsWith(".hpp") || filename.endsWith(".h")) {
    return "C++";
  }
  return "TypeScript";
}
