Page({
  data: {
    fullscreen: false,
    current: {},
    related: []
  },

  onLoad(o) {
    // 当前视频
    const current = {
      src: decodeURIComponent(o.src || ''),
      title: decodeURIComponent(o.title || '未命名视频'),
      troupeName: decodeURIComponent(o.troupe || ''),
      views: o.views || '0',
      thumb: decodeURIComponent(o.thumb || ''),
      desc: decodeURIComponent(o.desc || ''),
    }

    // 相关视频
    const related = []
    let i = 0
    while (o[`r${i}_title`]) {
      related.push({
        src: decodeURIComponent(o[`r${i}_src`] || ''),
        title: decodeURIComponent(o[`r${i}_title`] || ''),
        troupeName: decodeURIComponent(o[`r${i}_troupe`] || ''),
        views: o[`r${i}_views`] || '0',
        thumb: decodeURIComponent(o[`r${i}_thumb`] || ''),
      })
      i++
    }

    this.setData({ current, related })
    wx.setNavigationBarTitle({ title: current.title })
  },

  onFullscreen(e) {
    this.setData({ fullscreen: e.detail.fullScreen })
  },

  switchVideo(e) {
    const item = this.data.related[e.currentTarget.dataset.index]
    if (!item.src) {
      wx.showToast({ title: '该视频暂未上传', icon: 'none' })
      return
    }
    // 把当前视频换到列表里，选中项提到 current
    const oldList = [...this.data.related]
    oldList.splice(e.currentTarget.dataset.index, 1, this.data.current)
    this.setData({
      current: item,
      related: oldList
    })
    wx.setNavigationBarTitle({ title: item.title })
    wx.pageScrollTo({ scrollTop: 0 })
  },

  goBack() {
    wx.navigateBack()
  }
})
