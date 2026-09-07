const app = getApp()

Page({
  data: {
    isLogin: false,
    showLogin: false,
    userInfo: { nickName: '', avatarUrl: '' },
    stats: { collect: 0, history: 0, like: 0 },
    menuContent: [
      { id:1, key:'collect', icon:'star', label:'我的收藏' },
      { id:2, key:'history', icon:'time', label:'观看记录' },
      { id:3, key:'likes', icon:'thumb-up', label:'点赞记录' }
    ],
    menuService: [
      { id:1, key:'settings', icon:'setting', label:'设置' }
    ]
  },

  onLoad() {
    const saved = wx.getStorageSync('wyj_user')
    // 只有用户真正选了头像和昵称后才算登录，排除"微信用户"这种占位数据
    if (saved && saved.userInfo && saved.userInfo.nickName && saved.userInfo.nickName !== '微信用户' && saved.userInfo.avatarUrl) {
      this.setData({ isLogin: true, userInfo: saved.userInfo, stats: saved.stats || this.data.stats })
      app.syncUserProfile()
    } else {
      // 清除无效的缓存
      wx.removeStorageSync('wyj_user')
    }
  },

  handleLogin() {
    wx.login({ success: (r) => console.log('code:', r.code) })
    this.setData({ showLogin: true })
  },

  onCloseLogin() {
    this.setData({ showLogin: false })
  },

  onChooseAvatar(e) {
    const url = e.detail.avatarUrl
    wx.downloadFile({
      url,
      success: (r) => this.setData({ 'userInfo.avatarUrl': r.tempFilePath }),
      fail: () => this.setData({ 'userInfo.avatarUrl': url })
    })
  },

  onNicknameInput(e) {
    this.setData({ 'userInfo.nickName': e.detail.value })
  },

  async onSave() {
    // 如果用户没填昵称，就不让登录完成
    if (!this.data.userInfo.nickName || !this.data.userInfo.avatarUrl) {
      wx.showToast({ title: '请先选择头像和昵称', icon: 'none' })
      return
    }
    const nickName = this.data.userInfo.nickName
    const avatarUrl = this.data.userInfo.avatarUrl || ''
    const info = { nickName, avatarUrl }
    const stats = { collect: 0, history: 0, like: 0 }
    this.setData({ isLogin: true, showLogin: false, userInfo: info, stats: stats })
    wx.setStorageSync('wyj_user', { userInfo: info, stats: stats })
    wx.showLoading({ title: '保存中', mask: true })
    await app.syncUserProfile()
    wx.hideLoading()
    wx.showToast({ title: '登录成功', icon: 'success' })
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定退出吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('wyj_user')
          this.setData({ isLogin: false, userInfo: { nickName: '', avatarUrl: '' }, stats: { collect: 0, history: 0, like: 0, share: 0 } })
          wx.showToast({ title: '已退出', icon: 'none' })
        }
      }
    })
  },

  onMenuTap(e) {
    const { key } = e.currentTarget.dataset
    if (key === 'collect') {
      wx.navigateTo({ url: '/pages/list/list?type=favorites' })
      return
    }
    if (key === 'history') {
      wx.navigateTo({ url: '/pages/list/list?type=history' })
      return
    }
    if (key === 'likes') {
      wx.navigateTo({ url: '/pages/list/list?type=likes' })
      return
    }
    if (key === 'settings') {
      wx.navigateTo({ url: '/pages/settings/settings' })
      return
    }
    wx.showToast({ title: `${key} 功能开发中`, icon: 'none' })
  },

  // 每次显示时刷新收藏数
  onShow() {
    if (this.data.isLogin) {
      const app = getApp()
      this.setData({
        'stats.collect': app.getFavorites().length,
        'stats.history': app.getHistory().length,
        'stats.like': app.getLikeHistory().length
      })
    }
  }
})
