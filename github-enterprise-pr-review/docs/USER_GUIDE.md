# 用户操作手册

## 1. 初始化

```bash
./bin/geprr config init
```

按提示输入企业地址，并选择认证方式：

- `1` token
- `2` OAuth 设备流

## 2. 启动 Review

```bash
./bin/geprr
```

流程：

1. 拉取开放 PR 列表
2. 选择目标 PR
3. 选择语言模板
4. 自动分析变更文件
5. 预览 Markdown Review 报告
6. 确认后发布 PR 评论

## 3. 常见问题

- `AUTH_FAILED`：token/OAuth 权限不足
- `RATE_LIMIT`：触发限流，系统会自动重试
- `NO_OPEN_PR`：仓库暂无开放 PR
