# API 使用指南

## GitHub API 端点

- 列 PR：`GET /repos/{owner}/{repo}/pulls?state=open`
- PR 详情：`GET /repos/{owner}/{repo}/pulls/{number}`
- PR 文件：`GET /repos/{owner}/{repo}/pulls/{number}/files`
- 发评论：`POST /repos/{owner}/{repo}/issues/{number}/comments`

## OAuth 设备流

- 获取 device code：`POST /login/device/code`
- 轮询 access token：`POST /login/oauth/access_token`

## 缓存策略

- PR 列表缓存 key：`pr-list:{owner}/{repo}`
- PR 文件缓存 key：`pr-files:{owner}/{repo}#{number}`
- 默认 TTL：60 秒

## 重试策略

- 网络失败：指数退避重试
- `429`：读取 `retry-after` 等待
- `403 + x-ratelimit-remaining=0`：按 reset 时间等待
