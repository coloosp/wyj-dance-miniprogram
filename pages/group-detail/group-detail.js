const { getDisplayList } = require('../../data/videos.js')

Page({
  data: { name:'', tag:'', founder:'', district:'', programs:[], videos:[] },

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
  }
})
