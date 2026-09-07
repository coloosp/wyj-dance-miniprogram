# 舞影纪 · 微信小程序

当前项目是一个演示性质的重庆群众舞蹈艺术内容小程序，不是已上线的正式产品。本文档用于交接，帮助下一任开发者快速理解结构并跑起来。

## 快速开始

1. 用微信开发者工具导入本目录。
2. AppID：`wx4895e57dbf4857b7`，云开发环境：`cloudbase-d7ghywwf561a6e410`。
3. 在开发者工具里执行一次“构建 npm”（生成 `miniprogram_npm`，该目录已在 gitignore 中）。
4. 直接编译运行即可，无需本地启动服务。

## 技术栈

- 微信原生小程序（WXML / WXSS / JS），UI 使用 TDesign MiniProgram。
- 微信云开发：云函数 `proxy`、云数据库、云存储（用户头像 `avatars/`）。
- Cloudflare：R2 桶 `wyj-videos`（视频、封面、Banner）、Worker `wyj-api`、D1 `wyj-likes`。
- 业务数据链路：小程序 `app.js` 的 `api()` → `wx.cloud.callFunction('proxy')` → 云函数直连微信云数据库，或转发到 Cloudflare Worker。

## 目录结构

```text
app.js                 全局请求封装、用户身份、本地收藏/历史/点赞/打赏
app.json               页面路由、TabBar、组件按需注入
data/videos.js         视频列表与 R2 直链映射（含更新时间）
data/content.js        首页/发现/栏目等硬编码内容
data/art_troupes.md    区县艺术团名录参考资料
cloudfunctions/proxy   唯一云函数，统一读写微信云数据库
cloudflare             Worker、D1 schema、R2 相关配置
pages/                 页面源码
技术说明.md            更细的技术细节与已知问题
```

## 云端资源

| 资源 | 位置 | 用途 |
|---|---|---|
| 视频/封面/Banner | Cloudflare R2 `wyj-videos` | 通过 `pub-...r2.dev` 公开访问 |
| Worker API | `wyj-api` | 栏目内容点赞计数 |
| D1 | `wyj-likes` | 栏目内容点赞计数表 |
| 云数据库 | `comments` `comment_likes` `users` | 评论、评论点赞、用户资料 |
| 云数据库 | `video_stats` `video_likes` `video_favorites` | 视频播放量/点赞/收藏统计 |
| 云存储 | `avatars/` | 用户头像 fileID |

云函数 `proxy` 已部署，`wechatide CLI` 可增量部署。

## 已知限制

- `workers.dev` 在国内网络可能不可达，因此 Column 内容点赞仍走 Cloudflare Worker；评论、视频统计等已迁移到微信云数据库。
- 小程序未正式发布，`pages/pay-demo` 已从路由移除，舞团“打赏”仅为本地虚拟演示。
- `data/videos.js` 中 10 个视频已接入 R2，标题/简介为示例文案。
- 详细技术细节见 [技术说明.md](技术说明.md)。