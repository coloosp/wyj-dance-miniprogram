/**
 * 通用列表页
 * 通过 URL 参数 type 区分不同数据源：
 *   ?type=favorites  → 我的收藏（支持删除）
 *   ?type=history    → 观看记录
 *   ?type=likes      → 点赞记录
 *
 * 页面顶部可切换 scope：
 *   video   → 视频相关记录
 *   content → 原来的栏目/内容记录
 */

const app = getApp()

const TYPE_CONFIG = {
  favorites: {
    title: '我的收藏',
    emptyIcon: 'star',
    emptyDesc: '还没有收藏任何内容',
    dividerText: '点击右侧删除按钮可取消收藏',
    hasDelete: true,
    getList() { return app.getFavorites() },
    onDelete(id) {
      let list = app.getFavorites()
      list = list.filter(f => String(f.id) !== String(id))
      app.saveFavorites(list)
    }
  },
  history: {
    title: '观看记录',
    emptyIcon: 'time',
    emptyDesc: '还没有观看记录',
    dividerText: '',
    hasDelete: false,
    getList() { return app.getHistory() }
  },
  likes: {
    title: '点赞记录',
    emptyIcon: 'thumb-up',
    emptyDesc: '还没有点赞记录',
    dividerText: '',
    hasDelete: false,
    getList() { return app.getLikeHistory() }
  }
}

Page({
  data: {
    list: [],
    type: '',
    config: {},
    scope: 'video'
  },

  onLoad(o) {
    const type = o.type || 'favorites'
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.favorites
    this.setData({ type, config })
    wx.setNavigationBarTitle({ title: config.title })
  },

  onShow() {
    this.load()
  },

  switchScope(e) {
    this.setData({ scope: e.currentTarget.dataset.scope })
    this.load()
  },

  load() {
    const config = this.data.config
    if (!config.getList) return
    const all = config.getList()
    const scope = this.data.scope
    const list = all.filter(item => (item.kind || 'content') === scope)
    this.setData({ list })
  },

  goDetail(e) {
    const ds = e.currentTarget.dataset
    const kind = ds.kind
    if (kind === 'video') {
      const url = `/pages/player/player?id=${encodeURIComponent(ds.videoId || '')}&src=${encodeURIComponent(ds.src || '')}&title=${encodeURIComponent(ds.name || '')}&troupe=${encodeURIComponent(ds.troupe || '')}&views=${ds.views || 0}&thumb=${encodeURIComponent(ds.thumb || '')}`
      wx.navigateTo({ url })
      return
    }
    wx.navigateTo({ url: `/pages/detail/detail?id=${ds.id}&name=${ds.name}` })
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    if (this.data.config.onDelete) {
      this.data.config.onDelete(id)
      this.load()
      wx.showToast({ title: '已取消收藏', icon: 'none' })
    }
  }
})