const app = getApp()

Page({
  data: { showDialog: false },

  goPage(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({ url })
  },

  onClear() {
    this.setData({ showDialog: true })
  },

  onConfirmClear() {
    ['wyj_favorites', 'wyj_history', 'wyj_likeHistory', 'wyj_myLikes', 'wyj_user', 'wyj_openid', 'wyj_uid'].forEach(k => {
      wx.removeStorageSync(k)
    })
    this.setData({ showDialog: false })
    wx.showToast({ title: '已清除', icon: 'success' })
  },

  onCancel() {
    this.setData({ showDialog: false })
  }
})
