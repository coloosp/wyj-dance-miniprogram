/**
 * 代理云函数 — 将小程序请求转发到 Cloudflare Worker
 *
 * 为什么需要：小程序真机严格校验 request 合法域名，workers.dev 境外域名会被拦截。
 * 云函数运行在腾讯云境内，不受此限制，充当一层透明转发。
 *
 * 业务逻辑完全在 Worker 端，此函数不包含任何业务代码。
 */

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// Cloudflare Worker 地址
const WORKER_BASE = 'https://wyj-api.touhou31415.workers.dev'

exports.main = async (event) => {
  const path = event.path || '/api/likes'
  const method = event.method || 'GET'
  const data = event.data || {}

  let url = WORKER_BASE + path

  try {
    let res
    if (method === 'GET') {
      // GET 请求：参数拼到 URL
      const params = new URLSearchParams(data)
      if (params.toString()) url += '?' + params.toString()
      res = await fetch(url)
    } else {
      // POST 请求
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    }
    const result = await res.json()
    return result
  } catch (e) {
    console.error('代理请求失败:', e.message)
    return { error: e.message }
  }
}
