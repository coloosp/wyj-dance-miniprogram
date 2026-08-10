/**
 * 代理云函数
 *
 * - 评论与 openid 直接使用微信云数据库，避免 workers.dev 在国内被阻断。
 * - 点赞等其余接口继续转发到 Cloudflare Worker。
 */

const cloud = require('wx-server-sdk')
const axios = require('axios')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const COMMENTS = 'comments'

// Cloudflare Worker 地址
const WORKER_BASE = 'https://wyj-api.touhou31415.workers.dev'

exports.main = async (event) => {
  const path = event.path || '/api/likes'
  const method = event.method || 'GET'
  const data = event.data || {}
  const { OPENID, APPID } = cloud.getWXContext()

  if (path === '/api/getOpenid' && method === 'GET') {
    return { openid: OPENID || '', appid: APPID }
  }

  if (path === '/api/comments') {
    return method === 'GET' ? listComments(data) : createComment(data, OPENID)
  }

  return proxyToWorker(path, method, data)
}

async function listComments(data) {
  const video = String(data.video || '').trim()
  if (!video) return { error: 'missing video' }

  const where = { video_id: video, status: 1 }
  const [listRes, countRes] = await Promise.all([
    db.collection(COMMENTS).where(where).orderBy('created_at', 'desc').limit(50).get(),
    db.collection(COMMENTS).where(where).count()
  ])

  return {
    list: (listRes.data || []).map(toPublicComment),
    total: countRes.total || 0
  }
}

async function createComment(data, openid) {
  const video = String(data.video || '').trim()
  const content = String(data.content || '').trim()
  const nickname = String(data.nickname || '舞友').trim().slice(0, 30) || '舞友'

  if (!video) return { error: 'missing video' }
  if (!content) return { error: 'content required' }
  if (content.length > 200) return { error: 'content too long' }

  const addRes = await db.collection(COMMENTS).add({
    data: {
      video_id: video,
      openid: openid || 'anonymous',
      nickname,
      content,
      status: 1,
      created_at: db.serverDate()
    }
  })
  const doc = await db.collection(COMMENTS).doc(addRes._id).get()
  return { comment: toPublicComment(doc.data) }
}

function toPublicComment(doc) {
  return {
    id: doc._id,
    nickname: doc.nickname || '舞友',
    content: doc.content || '',
    created_at: formatCreatedAt(doc.created_at)
  }
}

function formatCreatedAt(value) {
  if (!value) return ''
  let d
  if (value instanceof Date) {
    d = value
  } else if (value && typeof value === 'object' && value.$date !== undefined) {
    d = new Date(Number(value.$date))
  } else {
    const n = Number(value)
    d = Number.isFinite(n) ? new Date(n) : new Date(value)
  }
  if (isNaN(d.getTime())) return String(value).slice(0, 19)
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

async function proxyToWorker(path, method, data) {
  const url = WORKER_BASE + path

  try {
    let res
    if (method === 'GET') {
      res = await axios.get(url, { params: data, timeout: 15000 })
    } else {
      res = await axios.post(url, data, { timeout: 15000 })
    }
    return res.data
  } catch (e) {
    console.error('代理请求失败:', e.message)
    if (e.response && e.response.data) return e.response.data
    return { error: e.message }
  }
}
