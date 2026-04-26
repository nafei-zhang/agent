# 企业私有化部署指南

## 1. 环境要求

- Node.js 18+
- Git 2.30+
- 可访问企业 GitHub API（建议白名单开放）

## 2. 安装

```bash
cd .trae/skills/github-enterprise-commit
npm install
npm run build
```

## 3. 首次配置

```bash
npx tsx src/cli.ts config init
```

输入：

- 企业地址：`https://github.company.com`
- 个人访问令牌：建议最小权限（`repo` / 必要组织权限）

## 4. 配置文件位置

- Windows: `%APPDATA%/gec-skill/config.json`
- macOS: `~/Library/Application Support/gec-skill/config.json`
- Linux: `$XDG_CONFIG_HOME/gec-skill/config.json`（默认 `~/.config/gec-skill/config.json`）

密钥文件同目录：`secret.key`。

## 5. 安全基线建议

- 定期轮换 PAT
- 使用短期 token（如企业支持）
- 将配置目录纳入终端安全策略与主机加固策略
- 禁止将配置目录同步到公共云盘

## 6. 运维与审计

- 使用 `history` / `search` 定期抽查提交规范执行情况
- 对关键分支开启服务端保护策略（PR 审核、状态检查）
- 建议结合 SIEM 记录 CLI 审计日志

## 7. 故障排查

- `NETWORK_ERROR`：检查网络、代理、证书链
- `AUTH_FAILED`：检查 PAT 权限和有效期
- `PUSH_FAILED`：先同步远端再推送
- `DECRYPT_FAILED`：密钥或配置不一致，重新初始化
