/**
 * 舞影纪 · Cloudflare Worker API
 *
 * 替代微信云开发的云函数 + 云数据库，所有接口统一在此 Worker 中处理。
 *
 * 部署后请在微信小程序后台 → 开发管理 → 服务器域名 → request合法域名
 * 添加此 Worker 的域名（如 https://wyj-api.example.workers.dev）
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    const cors = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }

    try {
      // ---- GET /api/getOpenid?code=xxx ----
      if (path === '/api/getOpenid' && method === 'GET') {
        const code = url.searchParams.get('code')
        if (!code) return json({ error: 'missing code' }, 400, cors)
        const result = await getOpenid(code, env.WX_APPID, env.WX_SECRET)
        return json(result, 200, cors)
      }

      // ---- GET /api/comments?video=xxx ----
      if (path === '/api/comments' && method === 'GET') {
        const video = url.searchParams.get('video') || ''
        if (!video) return json({ error: 'missing video' }, 400, cors)
        const rows = await env.DB.prepare(
          'SELECT id, nickname, content, created_at FROM comments WHERE video_id = ? AND status = 1 ORDER BY created_at DESC, id DESC LIMIT 50'
        ).bind(video).all()
        const totalRow = await env.DB.prepare(
          'SELECT COUNT(*) AS total FROM comments WHERE video_id = ? AND status = 1'
        ).bind(video).first()
        return json({ list: rows.results || [], total: totalRow.total || 0 }, 200, cors)
      }

      // ---- POST /api/comments ----
      if (path === '/api/comments' && method === 'POST') {
        const body = await request.json()
        const video = String(body.video || '').trim()
        const content = String(body.content || '').trim()
        const openid = String(body.openid || 'anonymous').slice(0, 128)
        const nickname = String(body.nickname || '舞友').trim().slice(0, 30) || '舞友'
        if (!video) return json({ error: 'missing video' }, 400, cors)
        if (!content || content.length > 200) return json({ error: 'content too long' }, 400, cors)
        const res = await env.DB.prepare(
          'INSERT INTO comments (video_id, openid, nickname, content) VALUES (?, ?, ?, ?)'
        ).bind(video, openid, nickname, content).run()
        const id = res.meta.last_row_id
        const comment = await env.DB.prepare(
          'SELECT id, nickname, content, created_at FROM comments WHERE id = ?'
        ).bind(id).first()
        return json({ comment }, 200, cors)
      }

      // ---- GET /api/likes?id=xxx ----
      if (path === '/api/likes' && method === 'GET') {
        const id = url.searchParams.get('id')
        if (!id) return json({ error: 'missing id' }, 400, cors)
        const count = await getLikeCount(env.DB, id)
        return json({ count }, 200, cors)
      }

      // ---- POST /api/likes/toggle  { id, delta: 1 | -1 } ----
      if (path === '/api/likes/toggle' && method === 'POST') {
        const body = await request.json()
        const { id, delta } = body
        if (!id || delta === undefined) return json({ error: 'missing id or delta' }, 400, cors)
        const count = await toggleLike(env.DB, id, delta)
        return json({ count }, 200, cors)
      }

      // ---- GET /api/likes/total ----
      if (path === '/api/likes/total' && method === 'GET') {
        const total = await getTotalLikes(env.DB)
        return json({ total }, 200, cors)
      }

      return json({ error: 'not found' }, 404, cors)

    } catch (e) {
      console.error(e)
      return json({ error: e.message || 'server error' }, 500, cors)
    }
  }
}

// ============================================================
// 工具函数
// ============================================================

function json(data, status, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders }
  })
}

// ============================================================
// 微信 openid 获取
// ============================================================

async function getOpenid(code, appid, secret) {
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
  const res = await fetch(url)
  const data = await res.json()
  if (data.openid) {
    return { openid: data.openid, appid }
  }
  return { error: data.errmsg || 'jscode2session failed', errcode: data.errcode }
}

// ============================================================
// D1 点赞计数操作（全部原子）
// ============================================================

async function getLikeCount(db, id) {
  const pageId = String(id)
  const row = await db.prepare('SELECT count FROM likes WHERE page_id = ?').bind(pageId).first()
  return row ? row.count : 0
}

async function toggleLike(db, id, delta) {
  const pageId = String(id)
  // 确保行存在
  await db.prepare('INSERT OR IGNORE INTO likes (page_id, count) VALUES (?, 0)').bind(pageId).run()
  // 原子增减，不低于 0
  await db.prepare('UPDATE likes SET count = MAX(0, count + ?) WHERE page_id = ?').bind(delta, pageId).run()
  // 返回最新值
  const row = await db.prepare('SELECT count FROM likes WHERE page_id = ?').bind(pageId).first()
  return row ? row.count : 0
}

async function getTotalLikes(db) {
  const row = await db.prepare('SELECT COALESCE(SUM(count), 0) AS total FROM likes').first()
  return row ? row.total : 0
}
