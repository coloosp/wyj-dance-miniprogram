# Cloudflare 云端说明

本目录维护 Cloudflare Worker、D1 schema 和 R2 相关资源。

## 资源

- R2 桶：`wyj-videos`，公开域名 `https://pub-261668b6483a438f8f09a549c5c0e4d1.r2.dev`
- Worker：`wyj-api`，部署于 `https://wyj-api.touhou31415.workers.dev`
- D1：`wyj-likes`，用于栏目内容点赞计数，schema 见 `schema.sql`

## 部署 Worker

确保本机已通过 wrangler 登录，然后在 `cloudflare` 目录执行：

```bash
npx wrangler deploy
```

`WX_SECRET` 为云函数/Worker 需要的微信 AppSecret，通过以下命令设置：

```bash
npx wrangler secret put WX_SECRET
```

## R2 上传

视频/封面等上传到 `wyj-videos`，例如：

```bash
npx wrangler r2 object put wyj-videos/1083627848-1-208.mp4 --file "..\videos\1083627848-1-208.mp4"
```

小程序侧通过 `data/videos.js` 的 `getUrl()` 统一拼接公开域名。