// ---- 后端请求封装（通过云函数代理到 Cloudflare Worker）----
// 真机环境微信严格校验域名白名单，workers.dev 可能被拦截，
// 因此通过云函数中转（云函数运行在腾讯云，不受此限制）。
function api(path, options = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'proxy',
      data: {
        path: path,
        method: options.method || 'GET',
        data: options.data || {}
      },
      success: (res) => {
        const result = res.result
        if (result && result.error) {
          console.error('[api]', path, result.error)
          reject(new Error(result.error))
        } else {
          resolve(result)
        }
      },
      fail: (err) => {
        console.error('[api]', path, err)
        reject(err)
      }
    })
  })
}

App({
  api,

  onLaunch() {
    // 初始化云开发（仅用于代理云函数）
    if (wx.cloud) {
      wx.cloud.init({ env: 'cloudbase-d7ghywwf561a6e410', traceUser: false })
    }
    // 初始化用户标识：通过代理 → Cloudflare Worker 换取 openid
    wx.login({
      success: (res) => {
        if (res.code) {
          api('/api/getOpenid', { data: { code: res.code } })
            .then(data => {
              const openid = data.openid
              if (openid) {
                wx.setStorageSync('wyj_openid', openid)
                const oldUid = wx.getStorageSync('wyj_uid')
                if (oldUid) wx.removeStorageSync('wyj_uid')
                console.log('用户 openid:', openid)
              }
            })
            .catch(() => {
              if (!wx.getStorageSync('wyj_uid')) {
                wx.setStorageSync('wyj_uid', 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8))
              }
            })
        }
      },
      fail: () => {
        if (!wx.getStorageSync('wyj_uid')) {
          wx.setStorageSync('wyj_uid', 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8))
        }
      }
    })
    console.log('舞影纪 · 重庆市群众舞蹈艺术音像资料馆 启动')
  },

  getUserId() {
    return wx.getStorageSync('wyj_openid') || wx.getStorageSync('wyj_uid') || 'anonymous'
  },

  getUserProfile() {
    const saved = wx.getStorageSync('wyj_user')
    return saved && saved.userInfo ? saved.userInfo : { nickName: '', avatarUrl: '' }
  },

  async syncUserProfile() {
    const userInfo = this.getUserProfile()
    const openid = this.getUserId()
    if (!userInfo.nickName) return

    let avatar = userInfo.avatarUrl || ''
    const isLocalPath = avatar && !avatar.startsWith('cloud://') && (
      avatar.indexOf('http://tmp') === 0 ||
      avatar.indexOf('wxfile://') === 0 ||
      avatar.indexOf('/') === 0
    )

    if (isLocalPath) {
      try {
        const upload = await new Promise((resolve, reject) => {
          wx.cloud.uploadFile({
            cloudPath: `avatars/${openid}_${Date.now()}.jpg`,
            filePath: avatar,
            success: resolve,
            fail: reject
          })
        })
        avatar = upload.fileID
        const saved = wx.getStorageSync('wyj_user') || {}
        saved.userInfo = { ...saved.userInfo, avatarUrl: avatar }
        wx.setStorageSync('wyj_user', saved)
      } catch (e) {
        console.error('[profile] avatar upload failed', e)
      }
    }

    try {
      await this.api('/api/users/sync', {
        method: 'POST',
        data: { nickname: userInfo.nickName, avatar }
      })
    } catch (e) {
      console.error('[profile] sync failed', e)
    }
  },

  globalData: {
    brand: {
      name: '舞影纪',
      english: 'DanceVerse',
      slogan: '舞动瞬间 · 数字永存 · 价值共享',
      institution: '重庆市群众舞蹈艺术音像资料馆'
    },

    categories: [
      { id: 1, name: '精品舞蹈集', icon: 'star-o', desc: '汇聚巴渝最优秀的群众舞蹈作品' },
      { id: 2, name: '获奖舞蹈集', icon: 'award-o', desc: '全国及省市级获奖作品收录' },
      { id: 3, name: '37个区县艺术团', icon: 'friends-o', desc: '合川·涪陵·北碚·万州……' },
      { id: 4, name: '群众舞蹈相关政策', icon: 'description-o', desc: '政策解读与发展方向指引' },
      { id: 5, name: '最新活动', icon: 'fire-o', desc: '演出·比赛·培训·交流' },
      { id: 6, name: '赛事集锦', icon: 'video-o', desc: '各级赛事精彩瞬间与回放' },
      { id: 7, name: '银发经济', icon: 'gold-coin-o', desc: '中老年舞蹈艺术与产业发展' },
      { id: 8, name: '旅游花絮', icon: 'location-o', desc: '文旅融合中的舞蹈元素' },
      { id: 9, name: '党员生活', icon: 'flag-o', desc: '党建引领群众文艺发展' }
    ],

    districts: [
      { name: '合川区', slug: 'hechuan', tag: '三江文化' },
      { name: '涪陵区', slug: 'fuling', tag: '榨菜之乡' },
      { name: '北碚区', slug: 'beibei', tag: '缙云山韵' },
      { name: '万州区', slug: 'wanzhou', tag: '三峡明珠' },
      { name: '渝中区', slug: 'yuzhong', tag: '母城核心' },
      { name: '沙坪坝区', slug: 'shapingba', tag: '红岩精神' },
      { name: '九龙坡区', slug: 'jiulongpo', tag: '工业文艺' },
      { name: '南岸区', slug: 'nanan', tag: '江南舞韵' },
      { name: '大渡口区', slug: 'dadukou', tag: '钢城新姿' },
      { name: '江北区', slug: 'jiangbei', tag: '观音桥韵' },
      { name: '渝北区', slug: 'yubei', tag: '空港风采' },
      { name: '巴南区', slug: 'banan', tag: '巴文化源' },
      { name: '长寿区', slug: 'changshou', tag: '长寿福地' },
      { name: '江津区', slug: 'jiangjin', tag: '聂帅故里' },
      { name: '永川区', slug: 'yongchuan', tag: '茶山竹海' },
      { name: '南川区', slug: 'nanchuan', tag: '金佛山韵' },
      { name: '綦江区', slug: 'qijiang', tag: '农民版画' },
      { name: '大足区', slug: 'dazu', tag: '石刻艺术' },
      { name: '璧山区', slug: 'bishan', tag: '田园都市' },
      { name: '铜梁区', slug: 'tongliang', tag: '龙舞之乡' },
      { name: '潼南区', slug: 'tongnan', tag: '油菜花海' },
      { name: '荣昌区', slug: 'rongchang', tag: '陶都风韵' },
      { name: '开州区', slug: 'kaizhou', tag: '帅乡风采' },
      { name: '梁平区', slug: 'liangping', tag: '竹海艺术' },
      { name: '武隆区', slug: 'wulong', tag: '喀斯特情' },
      { name: '城口县', slug: 'chengkou', tag: '巴山原乡' },
      { name: '丰都县', slug: 'fengdu', tag: '鬼城文化' },
      { name: '垫江县', slug: 'dianjiang', tag: '牡丹之乡' },
      { name: '忠县', slug: 'zhongxian', tag: '忠义之城' },
      { name: '云阳县', slug: 'yunyang', tag: '龙缸奇观' },
      { name: '奉节县', slug: 'fengjie', tag: '诗城奉节' },
      { name: '巫山县', slug: 'wushan', tag: '神女峰韵' },
      { name: '巫溪县', slug: 'wuxi', tag: '红池坝景' },
      { name: '石柱县', slug: 'shizhu', tag: '土家风情' },
      { name: '秀山县', slug: 'xiushan', tag: '边城花灯' },
      { name: '酉阳县', slug: 'youyang', tag: '桃花源记' },
      { name: '彭水县', slug: 'pengshui', tag: '乌江画廊' }
    ]
  },

  // 收藏管理
  getFavorites() {
    const raw = wx.getStorageSync('wyj_favorites')
    return raw ? JSON.parse(raw) : []
  },

  saveFavorites(list) {
    wx.setStorageSync('wyj_favorites', JSON.stringify(list))
  },

  isFavorited(id) {
    return this.getFavorites().some(f => f.id === id)
  },

  // 观看历史（LRU，上限100）
  MAX_HISTORY: 100,

  getHistory() {
    const raw = wx.getStorageSync('wyj_history')
    return raw ? JSON.parse(raw) : []
  },

  saveHistory(list) {
    wx.setStorageSync('wyj_history', JSON.stringify(list))
  },

  addHistory(item) {
    let list = this.getHistory()
    // 如果已存在，先删掉旧的
    list = list.filter(h => h.id !== item.id)
    // 放到最前面（最近访问）
    list.unshift(item)
    // 超过上限砍掉最旧的
    if (list.length > this.MAX_HISTORY) {
      list = list.slice(0, this.MAX_HISTORY)
    }
    this.saveHistory(list)
  },

  // 点赞（通过云函数代理 → Cloudflare Worker + D1，原子计数）
  async getLikeInfo(id) {
    const myWyjLikes = wx.getStorageSync('wyj_myLikes')
    const myLikes = myWyjLikes ? JSON.parse(myWyjLikes) : {}
    try {
      const data = await api('/api/likes', { data: { id } })
      return { count: data.count || 0, liked: !!myLikes[id] }
    } catch (e) {
      return { count: 0, liked: !!myLikes[id] }
    }
  },

  async toggleLike(id, name, desc) {
    const raw = wx.getStorageSync('wyj_myLikes')
    const myLikes = raw ? JSON.parse(raw) : {}

    if (myLikes[id]) {
      delete myLikes[id]
      wx.setStorageSync('wyj_myLikes', JSON.stringify(myLikes))
      this.removeLikeHistory(id)
      try {
        const data = await api('/api/likes/toggle', { method: 'POST', data: { id, delta: -1 } })
        return { count: data.count || 0, liked: false }
      } catch (e) { return { count: 0, liked: false } }
    } else {
      myLikes[id] = true
      wx.setStorageSync('wyj_myLikes', JSON.stringify(myLikes))
      this.addLikeHistory({ id, name, desc })
      try {
        const data = await api('/api/likes/toggle', { method: 'POST', data: { id, delta: 1 } })
        return { count: data.count || 1, liked: true }
      } catch (e) { return { count: 1, liked: true } }
    }
  },

  async getTotalLikes() {
    try {
      const data = await api('/api/likes/total')
      return data.total || 0
    } catch (e) { return 0 }
  },

  // 点赞历史（本地 LRU 100）
  MAX_LIKE_HISTORY: 100,
  getLikeHistory() { const raw = wx.getStorageSync('wyj_likeHistory'); return raw ? JSON.parse(raw) : [] },
  addLikeHistory(item) {
    let list = this.getLikeHistory(); list = list.filter(h => h.id !== item.id)
    list.unshift(item); if (list.length > this.MAX_LIKE_HISTORY) list = list.slice(0, this.MAX_LIKE_HISTORY)
    wx.setStorageSync('wyj_likeHistory', JSON.stringify(list))
  },
  removeLikeHistory(id) {
    let list = this.getLikeHistory(); list = list.filter(h => h.id !== id)
    wx.setStorageSync('wyj_likeHistory', JSON.stringify(list))
  },

  toggleFavorite(item) {
    let list = this.getFavorites()
    const idx = list.findIndex(f => f.id === item.id)
    if (idx > -1) {
      list.splice(idx, 1)
      return { action: 'removed', list }
    } else {
      list.unshift(item)
      return { action: 'added', list }
    }
  }
})
