const app = getApp()
const { BANNER_LIST, NOTICES, NAV_GROUPS, FEATURED_LIST } = require('../../data/content.js')

Page({
  data: {
    bannerList: BANNER_LIST,
    navGroups: NAV_GROUPS,
    notices: NOTICES,
    featuredList: FEATURED_LIST
  },

  goDetail(e) {
    const { id, name } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}&name=${name}` })
  },

  onPullDownRefresh() {
    wx.showToast({ title: '已刷新', icon: 'none' })
    wx.stopPullDownRefresh()
  }
})
