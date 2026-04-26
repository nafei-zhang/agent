# GitHub Enterprise PR Creator Skill

企业私有化场景下的标准化 Pull Request 创建工具，适用于 VS Code Copilot Chat Skill 模式。

## 功能特性

- 分支同步：创建前自动执行 `git fetch --all --prune`
- 分支选择：支持源分支/目标分支交互式选择
- 交互搜索：可按分支名、提交摘要、hash 过滤
- 信息展示：显示本地/远程标签、最后提交时间和摘要
- 创建前校验：未推送提交检查、冲突预检查、分支存在性验证
- PR 创建：采集标题/描述并调用企业 GitHub API 创建 PR
- 异常处理：网络、权限、422 校验失败等清晰反馈

## 快速开始

```bash
./bin/gepr config init
./bin/gepr
```

Windows:

```bat
bin\gepr.cmd config init
bin\gepr.cmd
```

说明：发布包已包含 `dist` 构建产物，终端仅需 Node.js 18+ 与 Git，无需执行 `npm install`。

开发者构建时会自动生成瘦身发布目录到当前 `skills` 根目录：

```bash
npm run build
# 输出目录: /Users/about/Downloads/skills/github-enterprise-pr-creator-lite
```

## 命令说明

- `gepr`：进入交互式 PR 创建流程
- `gepr config init`：初始化企业 URL + token
- `gepr config validate`：检查 API 连通和 token 有效性
- `gepr config show`：显示当前企业 API URL

等价执行方式：

- macOS/Linux：`./bin/gepr <sub-command>`
- Windows：`bin\gepr.cmd <sub-command>`
- 双语：追加 `--lang zh|en`，例如 `./bin/gepr --lang en`

## 本地调试流程

1. 在 VS Code 打开目录：`/Users/about/Downloads/skills/.agents/skills/github-enterprise-pr-creator`
2. 进入 Run and Debug，选择配置：
3. `GEPR: Debug TS`：调试 `src/cli.ts`（推荐）
4. `GEPR: Debug Dist`：调试 `dist/src/cli.js`
5. 在关键流程（分支选择/PR 创建）处打断点，按 `F5` 启动
6. 需要调试配置初始化时，将 `launch.json` 的 `args` 改为 `["config","init","--lang","en"]`

## PR 创建流程

1. 自动 fetch 最新远程分支
2. 展示并选择源分支（默认当前分支）
3. 展示并选择目标分支（默认推荐远程分支）
4. 校验分支存在性、未推送提交、潜在冲突
5. 输入 PR 标题与描述
6. 调用企业 GitHub API 创建 PR 并返回链接

## 安全说明

- token 以 AES-256-GCM 加密后落盘，不明文存储
- 配置文件与密钥文件存放在用户本地配置目录
- 建议企业接入密钥管理服务并设置 token 轮换策略

## 私有化部署

详见 `docs/DEPLOYMENT.md`。
