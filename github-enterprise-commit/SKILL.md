---
name: "github-enterprise-commit"
description: "Automates enterprise GitHub commits with secure config and Conventional Commits. Invoke when user asks to configure enterprise GitHub or perform guided commit/push/history actions."
---

# GitHub Enterprise Commit Skill

## Purpose

为 VS Code Copilot Chat 提供企业级 GitHub 提交自动化能力，支持：

- 企业 GitHub 自定义 API URL 与 token 安全配置
- Conventional Commits 规范化提交信息生成与校验
- 交互式提交、推送、历史查看、搜索、回滚
- 常见异常（网络、认证、冲突）可观测与可恢复处理

## Invoke When

在以下场景调用该 Skill：

- 用户要求“自动生成并执行符合 Conventional Commits 的提交”
- 用户需要“配置企业 GitHub 实例 URL 与 PAT”
- 用户要“查看近期提交、搜索历史、回滚错误提交”
- 用户希望“以可审计、可追溯方式执行标准化提交流程”

## Project Layout

- `src/cli.ts`: 交互式入口与命令分发
- `src/config-manager.ts`: URL 规范化、配置读写、认证验证
- `src/crypto-store.ts`: token 加密/解密与密钥管理
- `src/conventional-commits.ts`: 提交信息生成与格式校验
- `src/git-client.ts`: Git 仓库检测、提交、推送、历史与回滚
- `tests/*.test.ts`: 核心模块单元测试

## Usage

开箱即用模式（无需 npm install）：

```bash
./bin/gec config init
./bin/gec
```

配置企业实例：

```bash
./bin/gec config init
```

交互式提交（检测变更 -> 选择类型 -> 校验 -> commit + push）：

```bash
./bin/gec
```

历史管理：

```bash
./bin/gec history 20
./bin/gec search auth
./bin/gec rollback <commit-hash>
```

Windows 等价命令：

```bat
bin\gec.cmd config init
bin\gec.cmd
```

双语支持：可追加 `--lang zh|en`（示例：`./bin/gec --lang en`）。

## Guardrails

- 必须先执行 `config init` 并通过 `config validate`
- 必须通过 Conventional Commits 校验才允许提交
- 推送失败时不丢失本地提交，提示手动处理冲突后重试
