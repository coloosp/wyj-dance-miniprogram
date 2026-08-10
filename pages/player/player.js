const app = getApp()

function formatTime(value) {
  if (!value) return ''
  const d = new Date(String(value).replace(' ', 'T') + 'Z')
  if (isNaN(d.getTime())) return String(value)
  const pad = n => (n < 10 ? '0' + n : '' + n)
  return `${d.getMonth() + 1}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

Page({
  data: {
    fullscreen: false,
    current: {},
    related: [],
    videoId: '',
    comments: [],
    commentText: '',
    commentTotal: 0,
    submitting: false,
    loadingComments: true
  },

  onLoad(o) {
    const current = {
      id: decodeURIComponent(o.id || ''),
      src: decodeURIComponent(o.src || ''),
      title: decodeURIComponent(o.title || '未命名视频'),
      troupeName: decodeURIComponent(o.troupe || ''),
      views: o.views || '0',
      thumb: decodeURIComponent(o.thumb || ''),
      desc: decodeURIComponent(o.desc || ''),
    }

    const related = []
    let i = 0
    while (o[`r${i}_title`]) {
      related.push({
        id: decodeURIComponent(o[`r${i}_id`] || ''),
        src: decodeURIComponent(o[`r${i}_src`] || ''),
        title: decodeURIComponent(o[`r${i}_title`] || ''),
        troupeName: decodeURIComponent(o[`r${i}_troupe`] || ''),
        views: o[`r${i}_views`] || '0',
        thumb: decodeURIComponent(o[`r${i}_thumb`] || ''),
      })
      i++
    }

    const videoId = current.id || current.title
    this.setData({ current, related, videoId })
    wx.setNavigationBarTitle({ title: current.title })
    this.loadComments()
  },

  async loadComments() {
    if (!this.data.videoId) {
      this.setData({ loadingComments: false })
      return
    }
    this.setData({ loadingComments: true })
    try {
      const data = await app.api('/api/comments', { data: { video: this.data.videoId } })
      const comments = (data.list || []).map(c => ({ ...c, timeText: formatTime(c.created_at) }))
      this.setData({
        comments,
        commentTotal: data.total || comments.length,
        loadingComments: false
      })
    } catch (e) {
      console.error('[player] loadComments', e)
      this.setData({ loadingComments: false })
      wx.showToast({ title: '评论加载失败', icon: 'none' })
    }
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value })
  },

  async submitComment() {
    const content = (this.data.commentText || '').trim()
    if (!content) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }
    if (content.length > 200) {
      wx.showToast({ title: '评论最多200字', icon: 'none' })
      return
    }
    if (this.data.submitting) return

    this.setData({ submitting: true })
    try {
      const data = await app.api('/api/comments', {
        method: 'POST',
        data: {
          video: this.data.videoId,
          content,
          openid: app.getUserId(),
          nickname: '舞友'
        }
      })
      if (data.comment) {
        const comment = { ...data.comment, timeText: formatTime(data.comment.created_at) }
        this.setData({
          comments: [comment, ...this.data.comments],
          commentTotal: this.data.commentTotal + 1,
          commentText: ''
        })
        wx.showToast({ title: '评论成功', icon: 'success' })
      } else {
        wx.showToast({ title: data.error || '评论失败', icon: 'none' })
      }
    } catch (e) {
      console.error('[player] submitComment', e)
      wx.showToast({ title: '评论失败，请稍后重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
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
    const oldList = [...this.data.related]
    oldList.splice(e.currentTarget.dataset.index, 1, this.data.current)
    this.setData({
      current: item,
      related: oldList,
      videoId: item.id || item.title
    })
    wx.setNavigationBarTitle({ title: item.title })
    wx.pageScrollTo({ scrollTop: 0 })
    this.loadComments()
  },

  goBack() {
    wx.navigateBack()
  }
})
