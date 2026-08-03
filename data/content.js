/**
 * 舞影纪 · 统一内容数据层
 *
 * 所有页面展示的硬编码内容集中在此文件中管理。
 * 后续如需迁移到云数据库，只需替换此文件的导出源即可，
 * 所有消费页面无需改动。
 */

// ============================================================
// 栏目 ID → 主题色映射
// ============================================================
const COLORS = {
  1: '#C41E2A',
  2: '#D4503A',
  3: '#C41E2A',
  4: '#2C7EC4',
  5: '#E88A30',
  6: '#D45A3A',
  7: '#B88A3A',
  8: '#3AA87A',
  9: '#A83A3A'
}

// ============================================================
// 首页数据
// ============================================================

// Banner 轮播
const BANNER_LIST = [
  {
    id: 'brand',
    gradient: 'linear-gradient(160deg, #C41E2A 0%, #8B1A1A 40%, #5C1010 100%)',
    title: '舞影纪',
    subtitle: 'DanceVerse',
    slogan: '舞动瞬间 · 数字永存 · 价值共享',
    tag: '重庆市群众舞蹈艺术音像资料馆'
  },
  {
    id: 'event',
    gradient: 'linear-gradient(160deg, #E88A30 0%, #C47020 100%)',
    title: '全市群众舞蹈展演月',
    subtitle: '2026年8月 · 各区县巡回演出',
    tag: '🔥 火热进行中'
  },
  {
    id: 'featured',
    gradient: 'linear-gradient(160deg, #8B1A1A 0%, #5C1010 100%)',
    title: '红岩精神舞蹈创作研讨会',
    subtitle: '传承红色基因 · 舞动时代脉搏',
    tag: '📅 下周三 · 市群众艺术馆'
  }
]

// 公告滚动
const NOTICES = [
  '2026年8月全市群众舞蹈展演月启动，各区县火热报名',
  '第五届巴渝舞蹈艺术节精品节目征集开始',
  '红岩精神舞蹈创作研讨会下周举行'
]

// 导航分组
const NAV_GROUPS = [
  {
    id: 'dance', name: '舞蹈作品',
    items: [
      { id: 1, name: '精品舞蹈集', icon: 'star', desc: '汇聚巴渝最优秀群众舞蹈作品', color: COLORS[1] },
      { id: 2, name: '获奖舞蹈集', icon: 'star-filled', desc: '全国及省市级获奖作品收录', color: COLORS[2] }
    ]
  },
  {
    id: 'districts', name: '艺术团体',
    items: [
      { id: 3, name: '37个区县艺术团', icon: 'usergroup-circle', desc: '合川·涪陵·北碚·万州·石柱……', color: COLORS[3] }
    ]
  },
  {
    id: 'events', name: '活动赛事',
    items: [
      { id: 5, name: '最新活动', icon: 'notification', desc: '演出·比赛·培训·交流', color: COLORS[5] },
      { id: 6, name: '赛事集锦', icon: 'video-camera-1', desc: '各级赛事精彩瞬间与回放', color: COLORS[6] }
    ]
  },
  {
    id: 'info', name: '资讯服务',
    items: [
      { id: 4, name: '群众舞蹈相关政策', icon: 'file-1', desc: '政策解读与发展方向指引', color: COLORS[4] },
      { id: 7, name: '银发经济', icon: 'money', desc: '中老年舞蹈与产业发展', color: COLORS[7] },
      { id: 8, name: '旅游花絮', icon: 'location-1', desc: '文旅融合中的舞蹈元素', color: COLORS[8] },
      { id: 9, name: '党员生活', icon: 'flag-1', desc: '党建引领群众文艺发展', color: COLORS[9] }
    ]
  }
]

// 精选推荐
const FEATURED_LIST = [
  { id: 1, title: '《巴渝欢歌》· 市群众艺术馆', badge: '4K', views: '12,800' },
  { id: 2, title: '《三峡情韵》· 万州三峡艺术团', badge: '多机位', views: '9,560' },
  { id: 3, title: '《红梅赞》· 红岩舞蹈队', badge: '4D', views: '18,200' },
  { id: 4, title: '《土家摆手舞》· 石柱艺术团', badge: '4K', views: '7,340' }
]

// ============================================================
// 发现页数据
// ============================================================

// 快捷入口
const QUICK_ENTRIES = [
  { id: 5, label: '最新活动', icon: 'notification' },
  { id: 6, label: '赛事集锦', icon: 'video-camera-1' },
  { id: 7, label: '银发经济', icon: 'money' },
  { id: 8, label: '旅游花絮', icon: 'location-1' }
]

// 活动列表
const ACTIVITIES = [
  { month: '8月', day: '15', title: '重庆市群众舞蹈展演月开幕式', location: '解放碑广场', status: '进行中', statusType: 'primary' },
  { month: '9月', day: '05', title: '第五届巴渝舞蹈艺术节', location: '重庆大剧院', status: '即将开始', statusType: 'default' },
  { month: '10月', day: '11', title: '重阳节"银发风采"舞蹈汇演', location: '市老年活动中心', status: '即将开始', statusType: 'default' },
  { month: '11月', day: '20', title: '群众舞蹈创作培训班（第三期）', location: '市群众艺术馆', status: '即将开始', statusType: 'default' }
]

// 赛事列表
const COMPETITIONS = [
  { title: '2025重庆市群众舞蹈大赛', desc: '38支队伍参赛', date: '2025.10' },
  { title: '2025"舞动山城"广场舞邀请赛', desc: '千名舞者同台', date: '2025.08' },
  { title: '2024西南民族舞蹈邀请赛', desc: '24支代表队', date: '2024.11' }
]

// 旅游花絮列表
const TRAVEL_LIST = [
  { name: '武隆·土家摆手舞', desc: '天生三桥下的民族风情' },
  { name: '洪崖洞·快闪舞蹈', desc: '千与千寻的梦幻联动' },
  { name: '磁器口·川剧跨界', desc: '古镇里的艺术碰撞' },
  { name: '大足石刻·舞韵千年', desc: '石窟与舞蹈的美学对话' }
]

// ============================================================
// 栏目详情数据
// ============================================================

// 9 个栏目各自的详情内容，key 为栏目 ID
const CATEGORY_DETAIL = {
  1: {
    icon: 'star', color: COLORS[1],
    description: '精品舞蹈集汇聚了重庆市近年来最优秀的群众舞蹈作品。',
    subTitle: '代表作品', isCollapse: false,
    items: [
      '《巴渝欢歌》—— 重庆市群众艺术馆选送，荣获全国群星奖',
      '《两江春韵》—— 渝中区文化馆出品',
      '《山城记忆》—— 以重庆梯坎为灵感',
      '《红梅赞》—— 红色经典改编舞蹈，致敬红岩精神',
      '《雾都晨曦》—— 用舞蹈描绘重庆晨雾中的城市苏醒'
    ]
  },
  2: {
    icon: 'star-filled', color: COLORS[2],
    description: '获奖舞蹈集收录了重庆市在全国及省市级舞蹈比赛中斩获大奖的作品。',
    subTitle: '获奖荣誉', isCollapse: false,
    items: [
      '🏅 第十八届"群星奖"舞蹈类金奖 —— 《三峡情韵》',
      '🏅 全国广场舞大赛一等奖 —— 《幸福山城》',
      '🏅 "荷花奖"民族民间舞优秀作品 —— 《土家摆手舞新编》',
      '🏅 西南地区舞蹈展演金奖 —— 《长江之歌》',
      '🏅 重庆市"五个一工程"奖 —— 《红日照巴渝》'
    ]
  },
  3: {
    icon: 'usergroup-circle', color: COLORS[3],
    description: '重庆市下辖37个区县，每个区县都有独具特色的艺术团体。',
    subTitle: '区县艺术团一览', isCollapse: false,
    items: [
      '合川区群众艺术团 —— 三江汇流，文化交融',
      '涪陵区文化馆舞蹈队 —— 榨菜之乡的艺术之花',
      '北碚区群众舞蹈协会 —— 缙云山下的舞韵',
      '万州区三峡艺术团 —— 三峡库区的文化明珠',
      '渝中区山城舞蹈团 —— 母城核心的艺术力量',
      '沙坪坝区红岩舞蹈队 —— 传承红岩精神',
      '…… 更多区县艺术团等你发现'
    ]
  },
  4: {
    icon: 'file-1', color: COLORS[4],
    description: '本栏目汇集国家及重庆市关于群众文化、群众舞蹈艺术发展的相关政策文件与解读。',
    subTitle: '政策文件', isCollapse: true,
    collapseItems: [
      {
        title: '《"十四五"公共文化服务体系建设规划》',
        content: '提出了"十四五"期间公共文化服务体系建设的总体目标、重点任务和保障措施，对群众文艺发展提出了明确指导意见，强调要推动优质公共文化资源向基层延伸。'
      },
      {
        title: '《重庆市全民艺术普及实施方案》',
        content: '要求在全市范围内开展全民艺术普及工作，推动舞蹈等群众艺术走进社区、走进校园、走进乡村，实现艺术普及全覆盖。'
      },
      {
        title: '《关于繁荣发展社会主义文艺的意见》',
        content: '明确了新时代社会主义文艺工作的方向、方针和任务，对群众舞蹈创作提出了"扎根人民、深入生活"的创作导向。'
      },
      {
        title: '《重庆市非物质文化遗产保护条例》',
        content: '加强了对传统舞蹈等非物质文化遗产的保护力度，建立了代表性项目名录制度和传承人认定制度。'
      },
      {
        title: '《文化惠民工程实施方案》',
        content: '通过政府购买服务、文化志愿服务等多种形式，让群众免费或低费用享受优质舞蹈文化服务。'
      }
    ]
  },
  5: {
    icon: 'notification', color: COLORS[5],
    description: '最新活动栏目实时更新重庆市各地群众舞蹈相关活动信息。',
    subTitle: '近期活动', isCollapse: false,
    items: [
      '📅 2026年8月：重庆市群众舞蹈展演月',
      '📅 2026年9月：第五届巴渝舞蹈艺术节',
      '📅 2026年10月：重阳节"银发风采"舞蹈汇演',
      '📅 2026年11月：群众舞蹈创作培训班',
      '📅 2026年12月：年度群众舞蹈盛典'
    ]
  },
  6: {
    icon: 'video-camera-1', color: COLORS[6],
    description: '赛事集锦记录了重庆市各类群众舞蹈比赛的精彩瞬间与完整回放。',
    subTitle: '赛事记录', isCollapse: false,
    items: [
      '🎬 2025重庆市群众舞蹈大赛 —— 全市38支队伍',
      '🎬 2025"舞动山城"广场舞邀请赛 —— 千名舞者',
      '🎬 2024西南地区民族舞蹈邀请赛',
      '🎬 2024社区舞蹈擂台赛'
    ]
  },
  7: {
    icon: 'money', color: COLORS[7],
    description: '银发经济栏目关注中老年群体的舞蹈艺术需求与产业发展。',
    subTitle: '银发舞蹈专题', isCollapse: false,
    items: [
      '💡 广场舞经济：从自发活动到产业化运营',
      '💡 老年舞蹈培训市场分析',
      '💡 康养舞蹈：舞蹈疗愈与老年健康管理',
      '💡 银发舞团品牌化运营'
    ]
  },
  8: {
    icon: 'location-1', color: COLORS[8],
    description: '旅游花絮将舞蹈与重庆丰富的旅游资源相结合。',
    subTitle: '文旅舞蹈花絮', isCollapse: false,
    items: [
      '🏞️ 武隆喀斯特景区 —— 土家族摆手舞迎宾',
      '🏞️ 洪崖洞 —— 主题快闪舞蹈',
      '🏞️ 磁器口古镇 —— 川剧身段与现代舞碰撞',
      '🏞️ 大足石刻 —— 石窟艺术与舞蹈美学对话'
    ]
  },
  9: {
    icon: 'flag-1', color: COLORS[9],
    description: '党员生活栏目展现重庆市群众舞蹈领域党建工作与党员风采。',
    subTitle: '党建动态', isCollapse: false,
    items: [
      '🔴 "党建引领·舞动巴渝" —— 党建工作纪实',
      '🔴 红色舞蹈《信仰》创作谈',
      '🔴 党员文艺志愿者在行动',
      '🔴 "七一"主题舞蹈展演'
    ]
  }
}

module.exports = {
  COLORS,
  BANNER_LIST,
  NOTICES,
  NAV_GROUPS,
  FEATURED_LIST,
  QUICK_ENTRIES,
  ACTIVITIES,
  COMPETITIONS,
  TRAVEL_LIST,
  CATEGORY_DETAIL
}
