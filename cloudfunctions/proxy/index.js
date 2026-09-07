/**
 * 代理云函数
 *
 * - 评论、评论点赞、用户资料与 openid 直接使用微信云数据库。
 * - 点赞等其余接口继续转发到 Cloudflare Worker。
 */

const cloud = require('wx-server-sdk')
const axios = require('axios')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command
const COMMENTS = 'comments'
const COMMENT_LIKES = 'comment_likes'
const USERS = 'users'
const VIDEO_STATS = 'video_stats'
const VIDEO_LIKES = 'video_likes'
const VIDEO_FAVORITES = 'video_favorites'

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

  if (path === '/api/users/sync' && method === 'POST') {
    return syncUser(data, OPENID)
  }

  if (path === '/api/comments' && method === 'GET') {
    return listComments(data, OPENID)
  }

  if (path === '/api/comments' && method === 'POST') {
    return createComment(data, OPENID)
  }

  if (path === '/api/comments/like' && method === 'POST') {
    return toggleCommentLike(data, OPENID)
  }

  if (path === '/api/video/stats' && method === 'GET') {
    return getVideoStats(data, OPENID)
  }

  if (path === '/api/video/view' && method === 'POST') {
    return recordVideoView(data)
  }

  if (path === '/api/video/like' && method === 'POST') {
    return toggleVideoLike(data, OPENID)
  }

  if (path === '/api/video/favorite' && method === 'POST') {
    return toggleVideoFavorite(data, OPENID)
  }

  return proxyToWorker(path, method, data)
}

async function listComments(data, openid) {
  const video = String(data.video || '').trim()
  if (!video) return { error: 'missing video' }

  const topWhere = { video_id: video, status: 1, parent_id: null }
  const [topRes, countRes] = await Promise.all([
    db.collection(COMMENTS).where(topWhere).orderBy('created_at', 'desc').limit(50).get(),
    db.collection(COMMENTS).where({ video_id: video, status: 1 }).count()
  ])

  const topList = topRes.data || []
  const topIds = topList.map(item => item._id)

  let replyList = []
  if (topIds.length) {
    const replyRes = await db.collection(COMMENTS)
      .where({ video_id: video, status: 1, parent_id: _.in(topIds) })
      .limit(1000)
      .get()
    replyList = replyRes.data || []
  }

  const replyMap = {}
  replyList.forEach(item => {
    const key = item.parent_id
    if (!replyMap[key]) replyMap[key] = []
    replyMap[key].push(item)
  })

  const allIds = topIds.concat(replyList.map(item => item._id))
  const likedMap = allIds.length ? await getLikedMap(allIds, openid) : {}

  const list = topList.map(top => {
    const replies = (replyMap[top._id] || [])
      .slice()
      .sort((a, b) => toTime(b.created_at) - toTime(a.created_at))

    return {
      ...toPublicComment(top),
      like_count: top.like_count || 0,
      liked: !!likedMap[top._id],
      reply_count: top.reply_count || replies.length,
      replies: replies.map(reply => ({
        ...toPublicComment(reply),
        like_count: reply.like_count || 0,
        liked: !!likedMap[reply._id],
        reply_to_nickname: reply.reply_to_nickname || ''
      }))
    }
  })

  return { list, total: countRes.total || 0 }
}

async function getLikedMap(ids, openid) {
  if (!openid || !ids.length) return {}
  const res = await db.collection(COMMENT_LIKES)
    .where({ comment_id: _.in(ids), openid })
    .limit(1000)
    .get()
  const liked = {}
  ;(res.data || []).forEach(item => {
    liked[item.comment_id] = true
  })
  return liked
}

async function createComment(data, openid) {
  const video = String(data.video || '').trim()
  const content = String(data.content || '').trim()
  const parentId = String(data.parent_id || '').trim()
  const replyTo = String(data.reply_to_nickname || '').trim().slice(0, 30)
  const clientNickname = String(data.nickname || '').trim().slice(0, 30) || '舞友'
  const clientAvatar = String(data.avatar || '').trim().slice(0, 500)

  if (!video) return { error: 'missing video' }
  if (!content) return { error: 'content required' }
  if (content.length > 200) return { error: 'content too long' }

  const profile = openid ? await getUser(openid) : null
  const nickname = profile && profile.nickname ? profile.nickname : clientNickname
  const avatar = profile && profile.avatar !== undefined ? profile.avatar : clientAvatar
  if (openid && !profile && (nickname || avatar)) {
    await upsertUser(openid, nickname, avatar)
  }

  let parent = null
  if (parentId) {
    try {
      const parentRes = await db.collection(COMMENTS).doc(parentId).get()
      parent = parentRes.data
    } catch (e) {
      return { error: 'parent comment not found' }
    }
    if (!parent || parent.video_id !== video) {
      return { error: 'parent comment not found' }
    }
  }

  const addRes = await db.collection(COMMENTS).add({
    data: {
      video_id: video,
      parent_id: parentId || null,
      reply_to_nickname: parentId ? replyTo : '',
      openid: openid || 'anonymous',
      nickname,
      avatar,
      content,
      status: 1,
      like_count: 0,
      reply_count: 0,
      created_at: db.serverDate()
    }
  })

  if (parent) {
    await db.collection(COMMENTS).doc(parent._id).update({
      data: { reply_count: _.inc(1) }
    })
  }

  const createdRes = await db.collection(COMMENTS).doc(addRes._id).get()
  const created = createdRes.data
  return {
    comment: {
      ...toPublicComment(created),
      like_count: created.like_count || 0,
      liked: false,
      reply_count: created.reply_count || 0,
      replies: []
    }
  }
}

async function toggleCommentLike(data, openid) {
  const commentId = String(data.comment_id || '').trim()
  if (!commentId) return { error: 'missing comment_id' }
  if (!openid) return { error: 'missing openid' }

  let comment
  try {
    const res = await db.collection(COMMENTS).doc(commentId).get()
    comment = res.data
  } catch (e) {
    return { error: 'comment not found' }
  }

  const existing = await db.collection(COMMENT_LIKES)
    .where({ comment_id: commentId, openid })
    .limit(1)
    .get()
  const liked = existing.data.length > 0
  const wantLike = data.liked === true || data.action === 'like'

  if (wantLike && !liked) {
    await db.collection(COMMENT_LIKES).add({
      data: { comment_id: commentId, openid, created_at: db.serverDate() }
    })
    await db.collection(COMMENTS).doc(commentId).update({
      data: { like_count: _.inc(1) }
    })
    return { liked: true, like_count: (comment.like_count || 0) + 1 }
  }

  if (!wantLike && liked) {
    await db.collection(COMMENT_LIKES).where({ comment_id: commentId, openid }).remove()
    await db.collection(COMMENTS).doc(commentId).update({
      data: { like_count: _.inc(-1) }
    })
    return { liked: false, like_count: Math.max(0, (comment.like_count || 0) - 1) }
  }

  return { liked, like_count: comment.like_count || 0 }
}

async function getVideoStats(data, openid) {
  const videoId = normalizeVideoId(data.id)
  if (!videoId) return { error: 'missing video id' }
  const stat = await getOrCreateVideoStat(videoId)
  return {
    video_id: videoId,
    play_count: stat.play_count || 0,
    like_count: stat.like_count || 0,
    favorite_count: stat.favorite_count || 0,
    liked: openid ? await isVideoLiked(videoId, openid) : false,
    favorited: openid ? await isVideoFavorited(videoId, openid) : false
  }
}

async function recordVideoView(data) {
  const videoId = normalizeVideoId(data.id)
  if (!videoId) return { error: 'missing video id' }
  const stat = await getOrCreateVideoStat(videoId)
  await db.collection(VIDEO_STATS).doc(stat._id).update({
    data: { play_count: _.inc(1), updated_at: db.serverDate() }
  })
  return {
    video_id: videoId,
    play_count: (stat.play_count || 0) + 1,
    like_count: stat.like_count || 0,
    liked: false
  }
}

async function toggleVideoLike(data, openid) {
  const videoId = normalizeVideoId(data.id)
  if (!videoId) return { error: 'missing video id' }
  if (!openid) return { error: 'missing openid' }

  const stat = await getOrCreateVideoStat(videoId)
  const existing = await db.collection(VIDEO_LIKES)
    .where({ video_id: videoId, openid })
    .limit(1)
    .get()
  const liked = existing.data.length > 0
  const wantLike = data.liked === true || data.action === 'like'

  if (wantLike && !liked) {
    await db.collection(VIDEO_LIKES).add({
      data: { video_id: videoId, openid, created_at: db.serverDate() }
    })
    await db.collection(VIDEO_STATS).doc(stat._id).update({
      data: { like_count: _.inc(1), updated_at: db.serverDate() }
    })
    return {
      video_id: videoId,
      play_count: stat.play_count || 0,
      like_count: (stat.like_count || 0) + 1,
      liked: true
    }
  }

  if (!wantLike && liked) {
    await db.collection(VIDEO_LIKES).where({ video_id: videoId, openid }).remove()
    await db.collection(VIDEO_STATS).doc(stat._id).update({
      data: { like_count: _.inc(-1), updated_at: db.serverDate() }
    })
    return {
      video_id: videoId,
      play_count: stat.play_count || 0,
      like_count: Math.max(0, (stat.like_count || 0) - 1),
      liked: false
    }
  }

  return {
    video_id: videoId,
    play_count: stat.play_count || 0,
    like_count: stat.like_count || 0,
    liked
  }
}

async function toggleVideoFavorite(data, openid) {
  const videoId = normalizeVideoId(data.id)
  if (!videoId) return { error: 'missing video id' }
  if (!openid) return { error: 'missing openid' }

  const stat = await getOrCreateVideoStat(videoId)
  const existing = await db.collection(VIDEO_FAVORITES)
    .where({ video_id: videoId, openid })
    .limit(1)
    .get()
  const favorited = existing.data.length > 0
  const wantFavorite = data.favorited === true || data.action === 'favorite'

  if (wantFavorite && !favorited) {
    await db.collection(VIDEO_FAVORITES).add({
      data: { video_id: videoId, openid, created_at: db.serverDate() }
    })
    await db.collection(VIDEO_STATS).doc(stat._id).update({
      data: { favorite_count: _.inc(1), updated_at: db.serverDate() }
    })
    return {
      video_id: videoId,
      favorite_count: (stat.favorite_count || 0) + 1,
      favorited: true
    }
  }

  if (!wantFavorite && favorited) {
    await db.collection(VIDEO_FAVORITES).where({ video_id: videoId, openid }).remove()
    await db.collection(VIDEO_STATS).doc(stat._id).update({
      data: { favorite_count: _.inc(-1), updated_at: db.serverDate() }
    })
    return {
      video_id: videoId,
      favorite_count: Math.max(0, (stat.favorite_count || 0) - 1),
      favorited: false
    }
  }

  return {
    video_id: videoId,
    favorite_count: stat.favorite_count || 0,
    favorited
  }
}

async function isVideoFavorited(videoId, openid) {
  if (!openid) return false
  const res = await db.collection(VIDEO_FAVORITES)
    .where({ video_id: videoId, openid })
    .limit(1)
    .get()
  return res.data.length > 0
}
async function isVideoLiked(videoId, openid) {
  if (!openid) return false
  const res = await db.collection(VIDEO_LIKES)
    .where({ video_id: videoId, openid })
    .limit(1)
    .get()
  return res.data.length > 0
}

async function getOrCreateVideoStat(videoId) {
  const res = await db.collection(VIDEO_STATS)
    .where({ video_id: videoId })
    .limit(1)
    .get()
  if (res.data[0]) return res.data[0]

  const addRes = await db.collection(VIDEO_STATS).add({
    data: {
      video_id: videoId,
      play_count: 0,
      like_count: 0,
      favorite_count: 0,
      created_at: db.serverDate(),
      updated_at: db.serverDate()
    }
  })
  const created = await db.collection(VIDEO_STATS).doc(addRes._id).get()
  return created.data
}

function normalizeVideoId(value) {
  return String(value || '').trim()
}
async function syncUser(data, openid) {
  if (!openid) return { error: 'missing openid' }
  const nickname = String(data.nickname || '').trim().slice(0, 30) || '舞友'
  const avatar = String(data.avatar || '').trim().slice(0, 500)
  await upsertUser(openid, nickname, avatar)
  return { user: { nickname, avatar } }
}

async function getUser(openid) {
  if (!openid) return null
  try {
    const res = await db.collection(USERS).where({ openid }).limit(1).get()
    return res.data[0] || null
  } catch (e) {
    return null
  }
}

async function upsertUser(openid, nickname, avatar) {
  const existing = await getUser(openid)
  if (existing) {
    await db.collection(USERS).doc(existing._id).update({
      data: { nickname, avatar, updated_at: db.serverDate() }
    })
  } else {
    await db.collection(USERS).add({
      data: {
        openid,
        nickname,
        avatar,
        created_at: db.serverDate(),
        updated_at: db.serverDate()
      }
    })
  }
}

function toPublicComment(doc) {
  return {
    id: doc._id,
    nickname: doc.nickname || '舞友',
    avatar: doc.avatar || '',
    content: doc.content || '',
    created_at: formatCreatedAt(doc.created_at),
    reply_to_nickname: doc.reply_to_nickname || ''
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

function toTime(value) {
  if (!value) return 0
  const d = value instanceof Date ? value : new Date(value)
  return isNaN(d.getTime()) ? 0 : d.getTime()
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
