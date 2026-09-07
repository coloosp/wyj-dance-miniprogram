const app = getApp()

function formatTime(value) {
  if (!value) return ''
  const d = new Date(String(value).replace(' ', 'T') + 'Z')
  if (isNaN(d.getTime())) return String(value)
  const pad = n => (n < 10 ? '0' + n : '' + n)
  return `${d.getMonth() + 1}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function decorateReply(reply) {
  return {
    ...reply,
    timeText: formatTime(reply.created_at),
    avatarText: (reply.nickname || '舞').slice(0, 1)
  }
}

function decorateComment(comment) {
  const replies = (comment.replies || []).map(decorateReply)
  const replyCount = comment.reply_count || replies.length
  return {
    ...comment,
    timeText: formatTime(comment.created_at),
    avatarText: (comment.nickname || '舞').slice(0, 1),
    replies,
    previewReplies: replies.slice(0, 3),
    expanded: false,
    replyToggleText: '查看全部 ' + replyCount + ' 条回复'
  }
}

Page({
  data: {
    fullscreen: false,
    current: {},
    related: [],
    videoId: '',
    comments: [],
    commentText: '',
    replyText: '',
    replyingTo: null,
    replyFocused: false,
    commentTotal: 0,
    submitting: false,
    loadingComments: true,
    likingId: '',
    myAvatar: '',
    myNickname: '',
    myAvatarText: '舞',
    playCount: 0,
    likeCount: 0,
    videoLiked: false,
    videoToggling: false,
    videoFavorited: false,
    videoFavoriting: false,
    favoriteCount: 0
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

    const profile = app.getUserProfile()
    if (profile.nickName) app.syncUserProfile()

    const videoId = current.id || current.title
    this.setData({
      current,
      related,
      videoId,
      myAvatar: profile.avatarUrl || '',
      myNickname: profile.nickName || '',
      myAvatarText: (profile.nickName || '舞').slice(0, 1),
      videoFavorited: current.src ? app.isFavorited('video_' + videoId) : false
    })

    if (current.src) {
      app.addHistory({
        id: 'video_' + videoId,
        videoId,
        kind: 'video',
        name: current.title,
        desc: current.desc || '',
        src: current.src,
        thumb: current.thumb,
        troupe: current.troupeName,
        views: current.views,
        icon: '🎬'
      })
    }
    wx.setNavigationBarTitle({ title: current.title })
    if (current.src) {
      this.recordVideoView(videoId)
    } else {
      this.loadVideoStats(videoId)
    }
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
      const comments = (data.list || []).map(decorateComment)
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

  async loadVideoStats(videoId) {
    const id = videoId || this.data.videoId
    if (!id) return
    try {
      const data = await app.api('/api/video/stats', { data: { id } })
      this.setData({
        playCount: data.play_count || 0,
        likeCount: data.like_count || 0,
        videoLiked: !!data.liked
      })
    } catch (e) {
      console.error('[player] loadVideoStats', e)
    }
  },

  async recordVideoView(videoId) {
    const id = videoId || this.data.videoId
    if (!id || !this.data.current.src) return
    try {
      const data = await app.api('/api/video/view', {
        method: 'POST',
        data: { id }
      })
      this.setData({
        playCount: data.play_count || 0,
        likeCount: data.like_count || 0,
        videoLiked: !!data.liked
      })
    } catch (e) {
      console.error('[player] recordVideoView', e)
      this.loadVideoStats(id)
    }
  },

  async toggleVideoLike() {
    const id = this.data.videoId
    if (!id || this.data.videoToggling) return
    this.setData({ videoToggling: true })
    try {
      const data = await app.api('/api/video/like', {
        method: 'POST',
        data: { id, liked: !this.data.videoLiked }
      })
      const cur = this.data.current
      const fid = 'video_' + id
      if (data.liked) {
        app.addLikeHistory({ id: fid, videoId: id, kind: 'video', name: cur.title || '视频', desc: cur.desc || '', src: cur.src, thumb: cur.thumb, troupe: cur.troupeName, views: cur.views, icon: '🎬' })
      } else {
        app.removeLikeHistory(fid)
      }
      this.setData({
        likeCount: data.like_count || 0,
        videoLiked: !!data.liked
      })
    } catch (e) {
      console.error('[player] toggleVideoLike', e)
      wx.showToast({ title: '点赞失败', icon: 'none' })
    } finally {
      this.setData({ videoToggling: false })
    }
  },
  onCommentInput(e) {
    this.setData({ commentText: e.detail.value })
  },

  onReplyInput(e) {
    this.setData({ replyText: e.detail.value })
  },

  openReply(e) {
    const { parentId, nickname } = e.currentTarget.dataset
    this.setData({ replyingTo: { commentId: parentId, nickname }, replyText: '', replyFocused: true })
  },

  cancelReply() {
    this.setData({ replyingTo: null, replyText: '', replyFocused: false })
  },

  toggleReplies(e) {
    const index = e.currentTarget.dataset.index
    const comments = [...this.data.comments]
    comments[index].expanded = !comments[index].expanded
    comments[index].replyToggleText = comments[index].expanded
      ? '收起回复'
      : '查看全部 ' + comments[index].reply_count + ' 条回复'
    this.setData({ comments })
  },

  async submitComment() {
    const isReply = !!this.data.replyingTo
    const content = ((isReply ? this.data.replyText : this.data.commentText) || '').trim()
    if (!content) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }
    if (content.length > 200) {
      wx.showToast({ title: '评论最多200字', icon: 'none' })
      return
    }
    if (this.data.submitting) return

    const profile = app.getUserProfile()
    this.setData({ submitting: true })
    try {
      const data = await app.api('/api/comments', {
        method: 'POST',
        data: {
          video: this.data.videoId,
          content,
          parent_id: isReply ? this.data.replyingTo.commentId : '',
          reply_to_nickname: isReply ? this.data.replyingTo.nickname : '',
          nickname: profile.nickName || '',
          avatar: profile.avatarUrl || ''
        }
      })
      if (data.comment) {
        if (isReply) {
          const comments = [...this.data.comments]
          const index = comments.findIndex(item => item.id === this.data.replyingTo.commentId)
          if (index > -1) {
            const reply = decorateReply(data.comment)
            comments[index].replies = [...comments[index].replies, reply]
            comments[index].previewReplies = comments[index].replies.slice(0, 3)
            comments[index].reply_count = (comments[index].reply_count || 0) + 1
            comments[index].replyToggleText = comments[index].expanded
              ? '收起回复'
              : '查看全部 ' + comments[index].reply_count + ' 条回复'
            this.setData({
              comments,
              commentTotal: this.data.commentTotal + 1,
              replyText: '',
              replyingTo: null,
              replyFocused: false
            })
          }
        } else {
          const comment = decorateComment({ ...data.comment, replies: [] })
          this.setData({
            comments: [comment, ...this.data.comments],
            commentTotal: this.data.commentTotal + 1,
            commentText: ''
          })
        }
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

  async toggleCommentLike(e) {
    const { id, parentIndex, replyIndex } = e.currentTarget.dataset
    if (!id || this.data.likingId) return

    const isReply = replyIndex !== undefined
    const comment = this.data.comments[parentIndex]
    if (!comment) return
    const target = isReply ? comment.replies[replyIndex] : comment
    if (!target) return

    this.setData({ likingId: id })
    try {
      const data = await app.api('/api/comments/like', {
        method: 'POST',
        data: { comment_id: id, liked: !target.liked }
      })
      if (isReply) {
        const patch = {}
        patch[`comments[${parentIndex}].replies[${replyIndex}].liked`] = data.liked
        patch[`comments[${parentIndex}].replies[${replyIndex}].like_count`] = data.like_count
        this.setData(patch)
      } else {
        const patch = {}
        patch[`comments[${parentIndex}].liked`] = data.liked
        patch[`comments[${parentIndex}].like_count`] = data.like_count
        this.setData(patch)
      }
    } catch (err) {
      console.error('[player] toggleCommentLike', err)
      wx.showToast({ title: '点赞失败', icon: 'none' })
    } finally {
      this.setData({ likingId: '' })
    }
  },

  async toggleVideoFavorite() {
    const id = this.data.videoId
    const cur = this.data.current
    const fid = 'video_' + id
    const willFavorite = !this.data.videoFavorited
    const item = {
      id: fid,
      videoId: id,
      kind: 'video',
      name: cur.title || '未命名视频',
      desc: cur.desc || '',
      src: cur.src,
      thumb: cur.thumb,
      troupe: cur.troupeName,
      views: cur.views,
      icon: '🎬'
    }
    const result = app.toggleFavorite(item)
    app.saveFavorites(result.list)
    this.setData({ videoFavorited: willFavorite, videoFavoriting: true })
    try {
      const data = await app.api('/api/video/favorite', {
        method: 'POST',
        data: { id, favorited: willFavorite }
      })
      this.setData({ favoriteCount: data.favorite_count || 0 })
    } catch (e) {
      console.error('[player] toggleVideoFavorite', e)
    } finally {
      this.setData({ videoFavoriting: false })
      wx.showToast({ title: willFavorite ? '已收藏' : '已取消收藏', icon: 'none' })
    }
  },

  onShareAppMessage() {
    const cur = this.data.current
    const id = this.data.videoId
    return {
      title: cur.title || '舞影纪',
      path: `/pages/player/player?id=${encodeURIComponent(id || '')}&src=${encodeURIComponent(cur.src || '')}&title=${encodeURIComponent(cur.title || '')}&troupe=${encodeURIComponent(cur.troupeName || '')}&views=${cur.views || 0}&thumb=${encodeURIComponent(cur.thumb || '')}`
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
      videoId: item.id || item.title,
      comments: [],
      commentText: '',
      replyText: '',
      replyingTo: null,
      replyFocused: false
    })
    wx.setNavigationBarTitle({ title: item.title })
    wx.pageScrollTo({ scrollTop: 0 })
    this.recordVideoView()
    this.loadComments()
  },

  goBack() {
    wx.navigateBack()
  }
})
