const app = getApp()

// 每个区县的艺术团数据
const DISTRICT_TROUPES = {
  yuzhong: [
    { name:'渝中区文化馆爱博艺术团', tag:'文化馆直属', founder:'1985年' },
    { name:'渝中梦悦艺术水兵舞团', tag:'水兵舞', founder:'2016年' },
    { name:'渝中梅花艺术团', tag:'民族舞', founder:'2008年' },
    { name:'渝中区文化馆青年舞蹈队', tag:'青年团队', founder:'2012年' },
    { name:'浮图关社区红叶舞蹈队', tag:'社区团队', founder:'1998年' },
  ],
  shapingba: [
    { name:'沙坪坝区文化馆金沙青年舞蹈团', tag:'文化馆直属', founder:'2005年' },
    { name:'沙坪坝群英艺术团', tag:'综合艺术', founder:'1992年' },
    { name:'沙坪坝区宏韵艺术团', tag:'民族舞', founder:'2010年' },
    { name:'沙坪坝区英姿艺术团', tag:'广场舞', founder:'2015年' },
    { name:'沙坪坝区盎然舞蹈队', tag:'社区团队', founder:'2018年' },
  ],
  beibei: [
    { name:'北碚区文化馆广场舞示范队', tag:'文化馆直属', founder:'2010年' },
    { name:'北碚星艺艺术团', tag:'现代舞', founder:'2014年' },
  ],
  jiangbei: [
    { name:'江北区郭家沱街道铜锣之声艺术团', tag:'街道团队', founder:'2005年' },
    { name:'江北区文化馆舞蹈队', tag:'文化馆直属', founder:'2000年' },
  ],
  hechuan: [
    { name:'合川区青年舞蹈队', tag:'青年团队', founder:'2010年' },
    { name:'合川金阳城舞蹈队', tag:'社区团队', founder:'2015年' },
    { name:'合川江城艺术团', tag:'综合艺术', founder:'1995年' },
  ],
  fuling: [
    { name:'涪陵区义和镇荷花艺术团', tag:'乡镇团队', founder:'2008年' },
    { name:'重庆市涪陵区歌舞剧团', tag:'专业剧团', founder:'1965年' },
    { name:'涪陵区老朋友艺术团', tag:'中老年团队', founder:'2002年' },
    { name:'涪陵区文化馆锦绣舞蹈队', tag:'文化馆直属', founder:'2012年' },
  ],
  wanzhou: [
    { name:'万州区文化馆红河谷艺术团', tag:'文化馆直属', founder:'2003年' },
    { name:'万州金色年华舞蹈队', tag:'中老年团队', founder:'2010年' },
    { name:'万州平湖舞蹈队', tag:'广场舞', founder:'2016年' },
    { name:'重庆三峡歌舞剧团', tag:'专业剧团', founder:'1958年' },
  ],
  dadukou: [
    { name:'大渡口区跃进村街道义渡艺术团', tag:'街道团队', founder:'2006年' },
  ],
  changshou: [
    { name:'长寿"辉叔故事团"舞蹈组', tag:'志愿团队', founder:'2018年' },
    { name:'长寿区文化馆舞蹈队', tag:'文化馆直属', founder:'2000年' },
  ],
  tongliang: [
    { name:'铜梁龙舞艺术团', tag:'非遗传承', founder:'1990年' },
    { name:'铜梁区"龙乡之声"艺术团', tag:'综合艺术', founder:'2005年' },
  ],
}

// 生成占位团名
function makeTroupes(d) {
  if (DISTRICT_TROUPES[d.slug]) return DISTRICT_TROUPES[d.slug]
  return [
    { name: d.name + '文化馆舞蹈队', tag:'文化馆直属', founder:'2000年' },
    { name: d.name + '群众艺术团', tag:'综合艺术', founder:'2005年' },
    { name: d.name + '老年大学舞蹈队', tag:'中老年团队', founder:'2010年' },
  ]
}

Page({
  data: {
    district: {}, troupes: [],
  },
  onLoad(o) {
    const slug = o.slug || 'yuzhong'
    const name = o.name || ''
    const d = app.globalData.districts.find(d => d.slug === slug) || { name, slug }
    this.setData({ district: d, troupes: makeTroupes(d) })
    wx.setNavigationBarTitle({ title: d.name + '艺术团' })
  },
  goDetail(e) {
    const { name, tag, founder } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/group-detail/group-detail?name=${name}&tag=${tag}&founder=${founder}&district=${this.data.district.name}`
    })
  },
})
