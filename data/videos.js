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
 * @param {string} path - 存储桶中的文件路径，如 '1083627848-1-208.mp4'
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
    title: '《巴渝欢歌》',
    file: '1083627848-1-208.mp4',
    views: '12,800',
    desc: '以巴渝山水为灵感，展现山城人民勤劳朴实的精神风貌',
    updatedAt: '2026-08-10 12:00:00'
  },
  {
    id: 2,
    title: '《两江春韵》',
    file: '1343550371-1-192.mp4',
    views: '9,560',
    desc: '融合现代与传统，描绘两江交汇的壮美画卷',
    updatedAt: '2026-08-10 11:00:00'
  },
  {
    id: 3,
    title: '《红梅赞》',
    file: '1526324719-1-192.mp4',
    views: '18,200',
    desc: '红色经典改编，致敬红岩精神',
    updatedAt: '2026-08-10 10:00:00'
  },
  {
    id: 4,
    title: '《山城记忆》',
    file: '1565655411-1-192.mp4',
    views: '7,340',
    desc: '以重庆梯坎为灵感，讲述山城岁月的动人故事',
    updatedAt: '2026-08-10 09:00:00'
  },
  {
    id: 5,
    title: '《三峡情韵》',
    file: '162501212-1-208.mp4',
    views: '6,120',
    desc: '三峡库区的文化明珠，山水与人情交织',
    updatedAt: '2026-08-10 08:00:00'
  },
  {
    id: 6,
    title: '《土家摆手舞》',
    file: '27868004523-1-192.mp4',
    views: '5,480',
    desc: '土家风情摆手舞，传承非遗之美',
    updatedAt: '2026-08-10 07:00:00'
  },
  {
    id: 7,
    title: '《雾都晨曦》',
    file: '30812868147-1-192.mp4',
    views: '4,620',
    desc: '用舞蹈描绘重庆晨雾中的城市苏醒',
    updatedAt: '2026-08-10 06:00:00'
  },
  {
    id: 8,
    title: '《长江之歌》',
    file: '31649300927-1-192.mp4',
    views: '3,860',
    desc: '以长江为脉，唱响巴渝儿女的豪迈',
    updatedAt: '2026-08-10 05:00:00'
  },
  {
    id: 9,
    title: '《幸福山城》',
    file: '35149972589-1-192.mp4',
    views: '2,940',
    desc: '广场舞经典之作，展现山城幸福生活',
    updatedAt: '2026-08-10 04:00:00'
  },
  {
    id: 10,
    title: '《红日照巴渝》',
    file: '475932017-1-208.mp4',
    views: '2,160',
    desc: '红岩精神主题舞蹈，致敬初心与使命',
    updatedAt: '2026-08-10 03:00:00'
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