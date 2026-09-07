/**
 * 舞影纪 · 视频存储配置
 *
 * 所有视频资源 URL 集中在此管理。
 * 迁移存储桶时只需修改此文件的 BASE 配置和 getUrl() 函数，
 * 所有页面无需改动。
 *
 * 当前方案：Cloudflare R2（免费 10GB）
 * 备用方案：腾讯云 COS / 微信云开发存储
 */

// ============================================================
// 存储桶配置（迁移时改这里即可）
// ============================================================

// R2 公开访问域名
const R2_DOMAIN = 'https://pub-261668b6483a438f8f09a549c5c0e4d1.r2.dev'

// 存储桶类型标记，方便将来条件判断
const STORAGE_PROVIDER = 'cloudflare-r2'

/**
 * 根据文件路径生成完整视频 URL
 * 迁移时只需修改此函数内部逻辑，调用方无感知
 *
 * @param {string} path - 存储桶中的文件路径，如 '1062598260-1-192.mp4'
 * @returns {string} 完整可访问 URL
 */
function getUrl(path) {
  if (!path) return ''
  // 如果已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${R2_DOMAIN}/${path}`
}

/**
 * 生成缩略图路径
 * @param {string} name - 视频名称
 * @returns {string} 本地缩略图路径
 */
function getThumb(id) {
  // 当前 R2 中上传路径为 videos/videos/video_X.jpg
  return getUrl(`videos/videos/video_${id}.jpg`)
}

// ============================================================
// 视频数据（实际数据后续可从云数据库加载）
// ============================================================

const VIDEO_LIST = [
  {
    id: 1,
    title: '《巴渝欢歌》· 云存储测试',
    file: '1062598260-1-192.mp4',   // 文件名，通过 getUrl() 拼合
    views: '测试',
    desc: '',
    updatedAt: '2026-08-10 12:00:00'
  },
  {
    id: 2,
    title: '《两江春韵》',
    file: '',
    views: '1,560',
    desc: '',
    updatedAt: '2026-08-10 11:00:00'
  },
  {
    id: 3,
    title: '《红梅赞》',
    file: '',
    views: '4,200',
    desc: '',
    updatedAt: '2026-08-10 10:00:00'
  },
  {
    id: 4,
    title: '《山城记忆》',
    file: '',
    views: '980',
    desc: '',
    updatedAt: '2026-08-10 09:00:00'
  }
]

/**
 * 获取所有视频的展示数据（供页面直接使用）
 * @returns {Array<{id, title, thumb, src, views, desc, updatedAt}>}
 */
function getDisplayList() {
  return VIDEO_LIST.map(v => ({
    id: v.id,
    title: v.title,
    thumb: getThumb(v.id),
    src: getUrl(v.file),
    views: v.views,
    desc: v.desc,
    updatedAt: v.updatedAt || ''
  }))
}

module.exports = {
  // 配置信息
  STORAGE_PROVIDER,
  R2_DOMAIN,

  // 工具函数
  getUrl,
  getThumb,
  getDisplayList,

  // 原始数据（调试/扩展用）
  VIDEO_LIST
}