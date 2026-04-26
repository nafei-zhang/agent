# 企业私有化部署指南（PR Skill）

## 1. 环境要求

- Node.js 18+
- Git 2.30+
- 可访问企业 GitHub API

## 2. 安装与构建

```bash
cd /Users/about/Downloads/skills/.agents/skills/github-enterprise-pr-creator
npm install
npm run build
```

构建后会在 `skills` 根目录生成：

- `/Users/about/Downloads/skills/github-enterprise-pr-creator-lite`

## 3. 运行（无需 npm install）

```bash
cd /Users/about/Downloads/skills/github-enterprise-pr-creator-lite
./bin/gepr config init
./bin/gepr
```

Windows:

```bat
bin\gepr.cmd config init
bin\gepr.cmd
```

## 4. 配置文件位置

- Windows: `%APPDATA%/gepr-skill/config.json`
- macOS: `~/Library/Application Support/gepr-skill/config.json`
- Linux: `$XDG_CONFIG_HOME/gepr-skill/config.json`（默认 `~/.config/gepr-skill/config.json`）

## 5. 故障排查

- `FETCH_FAILED`：检查网络与仓库权限
- `AUTH_FAILED`：检查 PAT 权限和有效期
- `SOURCE_NOT_FOUND/TARGET_NOT_FOUND`：分支不存在或拉取不完整
- `MERGE_CONFLICT`：检测到潜在冲突，先本地解决后再创建 PR
- `PR_VALIDATION_FAILED`：无差异、重复 PR 或 head/base 不合法
