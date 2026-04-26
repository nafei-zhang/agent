---
name: "github-enterprise-pr-creator"
description: "Creates enterprise GitHub pull requests with branch fetch/select, validation, and error handling. Invoke when user asks to create PRs from interactive source/target branch flow."
---

# GitHub Enterprise PR Creator Skill

## Purpose

为 VS Code Copilot Chat 提供企业级 Pull Request 自动化能力，支持：

- 执行 `git fetch --all --prune` 同步远程分支
- 交互式选择源分支与目标分支（区分本地/远程）
- 分支搜索过滤并展示最后提交信息
- 创建 PR（标题、描述）并返回 PR 链接
- 创建前执行未推送提交检查与冲突预检查
- 网络、权限、分支缺失等异常的可读错误反馈

## Invoke When

在以下场景调用：

- 用户要求“创建 Pull Request”
- 用户希望“选择源/目标分支并发起 PR”
- 用户需要“创建前做冲突检查和未推送提交校验”
- 用户在企业 GitHub 环境下需要标准化 PR 提交流程

## Usage

开箱即用（无需 npm install）：

```bash
./bin/gepr config init
./bin/gepr
```

Windows:

```bat
bin\gepr.cmd config init
bin\gepr.cmd
```

双语支持：可追加 `--lang zh|en`（示例：`./bin/gepr --lang en`）。

## Guardrails

- 创建 PR 前必须先完成 `config init`
- 必须先 `git fetch` 再展示可选分支
- 检测到高风险冲突时阻断 PR 创建并提示先处理冲突
