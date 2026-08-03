# 舞影纪 · Cloudflare 迁移部署指南

## 部署步骤

### 1. 设置 API Token

```cmd
set CLOUDFLARE_API_TOKEN=你的token
```

### 2. 创建 KV 命名空间

```cmd
cd cloudflare
npx wrangler kv:namespace create "LIKES"
```

将输出的 `id` 填入 `wrangler.toml` 的 `[[kv_namespaces]]` → `id` 字段。

### 3. 设置微信 AppSecret

```cmd
npx wrangler secret put WX_SECRET
```

输入小程序 AppSecret（在微信小程序后台 → 开发管理 → 开发设置 中获取）。

### 4. 部署

```cmd
npx wrangler deploy
```

### 5. 配置小程序

- 将 Worker URL 填入 `app.js` 顶部的 `API_BASE`
- 在微信小程序后台 → 开发管理 → 服务器域名 → request 合法域名，添加 Worker URL
