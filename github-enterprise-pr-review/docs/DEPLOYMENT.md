# 部署指南

## 环境要求

- Node.js 18+
- Git 2.30+
- 企业 GitHub API 可访问

## 构建

```bash
cd /Users/about/Downloads/skills/.agents/skills/github-enterprise-pr-review
npm install
npm run build
```

## 产物

构建后自动输出：

- `/Users/about/Downloads/skills/github-enterprise-pr-review-lite`

该目录可直接运行（无需 npm install）：

```bash
cd /Users/about/Downloads/skills/github-enterprise-pr-review-lite
./bin/geprr config init
./bin/geprr
```
