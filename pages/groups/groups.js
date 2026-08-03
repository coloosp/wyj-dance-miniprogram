const app = getApp()

Page({
  data: {
    keyword: '', activeRegion: '全部',
    regions: ['主城都市区', '渝东北', '渝东南'],
    allDistricts: [], filteredDistricts: [], totalCount: 0
  },

  onLoad() {
    const d = app.globalData.districts
    this.setData({ allDistricts: d, filteredDistricts: d, totalCount: d.length })
  },

  onSearch(e) {
    const kw = e.detail.value.trim().toLowerCase()
    this.setData({ keyword: kw })
    this.apply()
  },

  onClear() { this.setData({ keyword: '' }); this.apply() },

  switchRegion(e) {
    const r = e.currentTarget.dataset.region
    this.setData({ activeRegion: r === this.data.activeRegion ? '全部' : r })
    this.apply()
  },

  apply() {
    let list = [...this.data.allDistricts]
    if (this.data.keyword) {
      const kw = this.data.keyword
      list = list.filter(d => d.name.includes(kw) || d.tag.includes(kw))
    }
    const r = this.data.activeRegion
    if (r === '主城都市区') list = list.slice(0, 22)
    else if (r === '渝东北') list = list.slice(22, 33)
    else if (r === '渝东南') list = list.slice(33)
    this.setData({ filteredDistricts: list })
  },

  goGroupDetail(e) {
    const { name, tag, slug } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/troupes/troupes?name=${name}&tag=${tag}&slug=${slug}` })
  }
})
