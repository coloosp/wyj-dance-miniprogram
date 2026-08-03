const app = getApp()
const { QUICK_ENTRIES, ACTIVITIES, COMPETITIONS, TRAVEL_LIST } = require('../../data/content.js')

Page({
  data: {
    activeTab: 0,
    quickEntries: QUICK_ENTRIES,
    activities: ACTIVITIES,
    competitions: COMPETITIONS,
    travelList: TRAVEL_LIST
  },

  onTabChange(e) {
    this.setData({ activeTab: e.detail.value })
  },

  goDetail(e) {
    const { id, name, url } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}&name=${name}` })
  }
})
