const app = getApp()
const { CATEGORY_DETAIL } = require('../../data/content.js')

// 栏目 ID 不存在时的回退数据
const FALLBACK = { icon: 'info-circle', color: '#C41E2A', description: '内容建设中', subTitle: '', isCollapse: false, items: [] }

Page({
  data: {
    loading: true, collapseValue: [],
    skeletonRows: [
      [ { type:'rect', height:'160px' } ],
      [ { type:'rect', height:'20px', width:'40%' }, { type:'rect', height:'14px' } ],
      [ { type:'rect', height:'120px' } ],
      [ { type:'rect', height:'20px', width:'30%' }, { type:'rect', height:'14px' } ],
      [ { type:'rect', height:'100px' } ]
    ],
    id:0, name:'', icon:'', color:'#C41E2A', description:'', subTitle:'',
    isCollapse:false, items:[], collapseItems:[], favorited: false, likeCount: 0, liked: false
  },

  onLoad(o) {
    const id = parseInt(o.id) || 1, name = o.name || ''
    const d = CATEGORY_DETAIL[id] || FALLBACK
    const favorited = app.isFavorited(id)
    app.getLikeInfo(id).then(({ count, liked }) => {
      this.setData({ likeCount: count, liked })
    })
    setTimeout(() => {
      this.setData({ id, name, ...d, loading: false, favorited })
    }, 200)
    wx.setNavigationBarTitle({ title: name })

    // 记录观看历史
    const desc = d.description ? d.description.slice(0, 30) : ''
    app.addHistory({ id, name, desc })
  },

  // 收藏/取消收藏
  async onLike() {
    const id = this.data.id
    const name = this.data.name
    const desc = this.data.description.slice(0, 30)
    const { count, liked } = await app.toggleLike(id, name, desc)
    this.setData({ likeCount: count, liked })
    wx.showToast({ title: liked ? '已点赞' : '已取消点赞', icon: 'none', duration: 800 })
  },

  onToggleFav() {
    const id = this.data.id
    const name = this.data.name
    const desc = this.data.description.slice(0, 30)
    const item = { id, name, desc, icon: '📄' }

    const result = app.toggleFavorite(item)
    app.saveFavorites(result.list)
    this.setData({ favorited: result.action === 'added' })
    wx.showToast({ title: result.action === 'added' ? '已收藏' : '已取消收藏', icon: 'none' })
  },
  onCollapseChange(e) {
    this.setData({ collapseValue: e.detail.value })
  },

  // 每次页面显示时刷新收藏和点赞状态，确保从其他页面返回后状态同步
  onShow() {
    const id = this.data.id
    if (id) {
      const favorited = app.isFavorited(id)
      app.getLikeInfo(id).then(({ count, liked }) => {
        this.setData({ favorited, likeCount: count, liked })
      })
    }
  }
})
