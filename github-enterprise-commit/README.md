# GitHub Enterprise Commit Skill

企业私有化场景下的标准化 Git 提交工具，适用于 VS Code Copilot Chat Skill 模式。

## 功能特性

- 企业 GitHub API URL 可配置（自动标准化到 `/api/v3`）
- PAT 加密存储（AES-256-GCM，密钥本地文件权限收敛）
- 配置验证（调用 `/user` 接口验证 token 与权限）
- Conventional Commits 强制执行
- 交互式提交流程（检测变更 -> 选择类型/scope -> 校验 -> 提交推送）
- 提交历史管理（查看、搜索、回滚）
- 跨平台支持：Windows / macOS / Linux

## 快速开始

```bash
./bin/gec config init
./bin/gec
```

Windows:

```bat
bin\gec.cmd config init
bin\gec.cmd
```

说明：发布包已包含 `dist` 构建产物，终端仅需安装 Node.js 18+ 与 Git，无需执行 `npm install`。

开发者构建时会自动生成瘦身发布目录到当前 `skills` 根目录：

```bash
npm run build
# 输出目录: /Users/about/Downloads/skills/github-enterprise-commit-lite
```

### 初始化配置

```bash
./bin/gec config init
```

### 验证配置

```bash
./bin/gec config validate
```

### 执行交互式提交

```bash
./bin/gec
```

## 命令说明

- `gec`：进入交互式提交流程
- `gec config init`：初始化企业 URL + token
- `gec config validate`：检查 API 连通和 token 有效性
- `gec config show`：显示已配置企业 API URL
- `gec history [limit]`：查看最近提交
- `gec search <keyword>`：按关键字搜索提交
- `gec rollback <hash>`：回滚指定提交

等价执行方式：

- macOS/Linux：`./bin/gec <sub-command>`
- Windows：`bin\gec.cmd <sub-command>`
- 双语：追加 `--lang zh|en`，例如 `./bin/gec --lang en`

## 本地调试流程

1. 在 VS Code 打开目录：`/Users/about/Downloads/skills/.agents/skills/github-enterprise-commit`
2. 进入 Run and Debug，选择配置：
3. `GEC: Debug TS`：调试 `src/cli.ts`（推荐日常开发）
4. `GEC: Debug Dist`：调试 `dist/src/cli.js`（验证构建产物）
5. 在代码中打断点后按 `F5` 启动，默认参数为 `--lang en`
6. 若要调试初始化流程，可在 `launch.json` 的 `args` 改为 `["config","init","--lang","en"]`

## Conventional Commits

支持类型：

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `test`
- `chore`
- `perf`
- `build`
- `ci`
- `revert`

提交格式：

```text
type(scope): description
```

示例：

```text
feat(auth): add enterprise sso callback
fix(api): handle timeout retry for ghes
```

## 错误处理

- 网络异常：提示检查企业地址、DNS、防火墙、代理
- 认证失败：提示重新生成 PAT 或检查权限范围
- 推送冲突：保留本地提交并提示先 `git pull --rebase` 后重试
- 回滚冲突：提示人工处理冲突并继续 revert 流程

## 安全说明

- token 仅以密文写入配置文件，不明文落盘
- 加密算法：AES-256-GCM
- 密钥文件默认权限收敛为当前用户可读写
- 建议企业进一步接入系统密钥链或密钥管理服务（KMS/Vault）

## 私有化部署

详见 `docs/DEPLOYMENT.md`。
