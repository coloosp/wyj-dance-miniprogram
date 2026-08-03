const AMOUNTS = [
  { value: 6, label: '6 元', desc: '轻量支持' },
  { value: 18, label: '18 元', desc: '标准支持' },
  { value: 66, label: '66 元', desc: '深度支持' }
]

Page({
  data: {
    amounts: AMOUNTS,
    selected: 18,
    paying: false,
    success: false,
    orderNo: ''
  },

  onChooseAmount(e) {
    const value = Number(e.currentTarget.dataset.value)
    this.setData({ selected: value })
  },

  onPay() {
    if (this.data.paying) return
    this.setData({ paying: true })
    setTimeout(() => {
      this.setData({
        paying: false,
        success: true,
        orderNo: 'WYJ' + Date.now()
      })
    }, 1200)
  },

  onReset() {
    this.setData({ success: false, orderNo: '' })
  },

  goBack() {
    wx.navigateBack()
  }
})
