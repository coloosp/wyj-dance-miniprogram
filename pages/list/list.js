/**
 * 通用列表页
 * 通过 URL 参数 type 区分不同数据源：
 *   ?type=favorites  → 我的收藏（支持删除）
 *   ?type=history    → 观看记录
 *   ?type=likes      → 点赞记录
 *
 * 新增列表类型只需在 TYPE_CONFIG 中加一项配置即可，无需新建页面。
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
      list = list.filter(f => f.id !== id)
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
    config: {}
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

  load() {
    const config = this.data.config
    if (config.getList) {
      this.setData({ list: config.getList() })
    }
  },

  goDetail(e) {
    const { id, name } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}&name=${name}` })
  },

  onDelete(e) {
    const id = parseInt(e.currentTarget.dataset.id)
    if (this.data.config.onDelete) {
      this.data.config.onDelete(id)
      this.load()
      wx.showToast({ title: '已取消收藏', icon: 'none' })
    }
  }
})
