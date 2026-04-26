---
name: "github-enterprise-pr-review"
description: "Reviews enterprise GitHub pull requests and posts structured comments. Invoke when user asks to list PRs, generate review reports, and publish PR comments."
---

# GitHub Enterprise PR Review Skill

## Purpose

为企业 GitHub 提供完整 PR Review 自动化：

- 拉取开放 PR 列表并交互式选择
- 多语言模板化评审（JS/TS/Python/Java/Go/C++）
- 生成结构化 Markdown 评审报告（Critical/Major/Minor）
- 预览并自动发布 PR 评论（含分段发布）
- OAuth 与 token 认证、缓存、重试、限流处理

## Invoke When

- 用户要求“对某个 PR 做代码评审并发布评论”
- 用户需要“先列 PR，再选一个进行 review”
- 用户希望“使用特定语言模板进行结构化审查”

## Usage

```bash
./bin/geprr config init
./bin/geprr
```

Windows:

```bat
bin\geprr.cmd config init
bin\geprr.cmd
```

双语支持：可追加 `--lang zh|en`（示例：`./bin/geprr --lang en`）。
