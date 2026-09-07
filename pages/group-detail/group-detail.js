const app = getApp()
const { getDisplayList } = require('../../data/videos.js')

const TIP_AMOUNTS = [
  { value: 0.66, label: '0.66', desc: '小小心意' },
  { value: 6.6, label: '6.6', desc: '支持演出' },
  { value: 16.6, label: '16.6', desc: '助力舞团' }
]

Page({
  data: {
    name: '', tag: '', founder: '', district: '', programs: [], videos: [],
    tipAmounts: TIP_AMOUNTS,
    selectedTip: 6.6,
    showTip: false,
    tipPaying: false,
    tipSuccess: false,
    tipOrderNo: '',
    tipAmountText: '',
    sortBy: 'updated',
    sortOptions: [
      { key: 'updated', label: '更新时间' },
      { key: 'plays', label: '播放量' },
      { key: 'likes', label: '点赞' },
      { key: 'favs', label: '收藏' }
    ],
    videoStatsLoading: false
  },

  onLoad(options) {
    const name = options.name || ''
    const tag = options.tag || ''
    const founder = options.founder || ''
    const district = options.district || ''

    const programs = [
      { name:'《巴渝欢歌》', type:'民族舞', duration:'5:20', desc:'以巴渝山水为灵感，展现山城人民勤劳朴实的精神风貌' },
      { name:'《两江春韵》', type:'现代舞', duration:'4:45', desc:'融合现代与传统，描绘两江交汇的壮美画卷' },
      { name:'《山城记忆》', type:'民间舞', duration:'6:10', desc:'以重庆梯坎为灵感，讲述山城岁月的动人故事' },
      { name:'《红梅赞》', type:'红色经典', duration:'5:00', desc:'红色经典改编，致敬红岩精神' },
      { name:'《雾都晨曦》', type:'当代舞', duration:'4:30', desc:'用舞蹈描绘重庆晨雾中的城市苏醒' },
    ]

    // 视频数据统一从 data/videos.js 加载，迁移存储桶时只需改那一个文件
    const videos = getDisplayList()

    this.setData({ name, tag, founder, district, programs, videos })
    wx.setNavigationBarTitle({ title: name })
    this.loadVideoStats()
  },

  playVideo(e) {
    const { id, src, title, views, thumb } = e.currentTarget.dataset
    const troupeName = this.data.name
    if (!src) {
      wx.showToast({ title: '视频暂未上传', icon: 'none' })
      return
    }
    let url = `/pages/player/player?id=${encodeURIComponent(id || '')}&src=${encodeURIComponent(src)}&title=${encodeURIComponent(title || '')}&troupe=${encodeURIComponent(troupeName)}&views=${views || 0}`
    this.data.videos.forEach((v, i) => {
      url += `&r${i}_id=${encodeURIComponent(v.id || '')}&r${i}_src=${encodeURIComponent(v.src || '')}&r${i}_title=${encodeURIComponent(v.title)}&r${i}_troupe=${encodeURIComponent(troupeName)}&r${i}_views=${v.views || '0'}&r${i}_thumb=${encodeURIComponent(v.thumb || '')}`
    })
    wx.navigateTo({ url })
  },

  onShow() {
    if (this.data.videos.length) this.loadVideoStats()
  },

  async loadVideoStats() {
    if (this.data.videoStatsLoading) return
    this.setData({ videoStatsLoading: true })
    try {
      const results = await Promise.all(this.data.videos.map(async v => {
        if (!v.id) return { ...v, playCount: 0, likeCount: 0, favCount: 0 }
        try {
          const data = await app.api('/api/video/stats', { data: { id: v.id } })
          return {
            ...v,
            playCount: data.play_count || 0,
            likeCount: data.like_count || 0,
            favCount: data.favorite_count || 0
          }
        } catch (e) {
          return { ...v, playCount: 0, likeCount: 0, favCount: 0 }
        }
      }))
      this.setData({ videos: results })
      this.applySort()
    } catch (e) {
      console.error('[group-detail] loadVideoStats', e)
    } finally {
      this.setData({ videoStatsLoading: false })
    }
  },

  setSort(e) {
    this.setData({ sortBy: e.currentTarget.dataset.key })
    this.applySort()
  },

  applySort() {
    const sortBy = this.data.sortBy
    const list = [...this.data.videos]
    const sortable = list.filter(v => !!v.src)
    const placeholder = list.filter(v => !v.src)

    sortable.sort((a, b) => {
      if (sortBy === 'updated') {
        return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))
      }
      if (sortBy === 'plays') return (b.playCount || 0) - (a.playCount || 0)
      if (sortBy === 'likes') return (b.likeCount || 0) - (a.likeCount || 0)
      if (sortBy === 'favs') return (b.favCount || 0) - (a.favCount || 0)
      return 0
    })

    this.setData({ videos: sortable.concat(placeholder) })
  },
  openTip() {
    this.setData({ showTip: true, tipSuccess: false, tipPaying: false, tipOrderNo: '' })
  },

  closeTip() {
    if (this.data.tipPaying) return
    this.setData({ showTip: false, tipSuccess: false, tipOrderNo: '' })
  },

  onChooseTip(e) {
    this.setData({ selectedTip: Number(e.currentTarget.dataset.value) })
  },

  confirmTip() {
    if (this.data.tipPaying) return
    const amount = this.data.selectedTip
    this.setData({ tipPaying: true })
    setTimeout(() => {
      const orderNo = 'WYT' + Date.now()
      this.saveTipRecord(amount, orderNo)
      this.setData({
        tipPaying: false,
        tipSuccess: true,
        tipOrderNo: orderNo,
        tipAmountText: amount.toFixed(2)
      })
    }, 900)
  },

  finishTip() {
    this.setData({ showTip: false, tipSuccess: false, tipOrderNo: '', tipAmountText: '' })
  },

  saveTipRecord(amount, orderNo) {
    const raw = wx.getStorageSync('wyj_tips')
    const list = raw ? JSON.parse(raw) : []
    list.unshift({
      id: orderNo,
      troupeName: this.data.name,
      district: this.data.district,
      amount,
      time: Date.now()
    })
    wx.setStorageSync('wyj_tips', JSON.stringify(list.slice(0, 50)))
  }
})