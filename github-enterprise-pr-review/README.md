# GitHub Enterprise PR Review Skill

企业 GitHub Pull Request Review 自动化工具，支持 PR 列表拉取、模板化审查、报告生成与自动评论发布。

## 核心能力

- 远程 PR 列表获取与交互选择
- 多语言模板系统（JavaScript、TypeScript、Python、Java、Go、C++）
- 结构化 Markdown 报告输出（摘要、分级问题、片段、正向反馈）
- PR 评论自动化发布（分段处理，避免超长）
- OAuth 设备流 + token 认证
- 缓存、限流、重试、错误处理

## 快速开始

```bash
./bin/geprr config init
./bin/geprr
```

Windows:

```bat
bin\geprr.cmd config init
bin\geprr.cmd
```

双语支持：

- 使用 `--lang zh|en`，例如 `./bin/geprr --lang en`

## 本地调试流程

1. 在 VS Code 打开目录：`/Users/about/Downloads/skills/.agents/skills/github-enterprise-pr-review`
2. 进入 Run and Debug，选择配置：
3. `GEPRR: Debug TS`：调试 `src/cli.ts`（推荐）
4. `GEPRR: Debug Dist`：调试 `dist/src/cli.js`
5. 在 `src/cli.ts`、`src/github-api.ts`、`src/review-engine.ts` 打断点后按 `F5` 启动
6. 调试认证初始化时，可将 `launch.json` 的 `args` 改为 `["config","init","--lang","en"]`

## 构建与发布

```bash
npm install
npm run build
```

构建后自动生成瘦身包到：

- `/Users/about/Downloads/skills/github-enterprise-pr-review-lite`

## 文档

- `docs/USER_GUIDE.md`
- `docs/API.md`
- `docs/DEPLOYMENT.md`
- `examples/sample-review.md`
