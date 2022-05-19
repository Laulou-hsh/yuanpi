/**
 * 构造 query string
 * @param {object} data 用来构造 query 的对象
 */
const genQuery = data => {
  if (!data) return ''
  return Object.keys(data)
    .map(key => {
      const val = data[key]
      return `${key}=${String(val)}`
    })
    .join('&')
}

/**
 * 根据 name 构造 URL，包括 route 和 query
 * @param {string} name 与页面文件名相同
 * @param {object} data 用来构造 query 的对象
 */
const genURL = ({name, data}) => {
  const url = `/pages/${name}/${name}`
  const query = genQuery(data)

  return query ? `${url}?${query}` : url
}

/**
 * 构造当前页面 URL，包括 route 和 query
 * @param {object} data 用来构造 query 的对象
 */
const genCurrentURL = data => {
  const currentPage = getCurrentPages().slice(-1)[0]
  const url = '/' + currentPage.route
  const query = genQuery(data)

  return query ? `${url}?${query}` : url
}

/**
 * 解析传入的参数
 * @param {object} params {name, data, success, fail, complete}
 */
const parseParams = params => {
  const {name, data, success = () => {}, fail = () => {}, complete = () => {}} = params
  if (!name) throw Error('Route name is required.')

  const url = genURL({name, data})
  return {url, success, fail, complete}
}

export default {
  genURL,
  genCurrentURL,

  push({name, data, success, fail, complete}) {
    console.log('==> name, data', parseParams({name, data, success, fail, complete}))

    wx.navigateTo(parseParams({name, data, success, fail, complete}))
  },

  replace({name, data, success, fail, complete}) {
    wx.redirectTo(parseParams({name, data, success, fail, complete}))
  },

  relaunch({name, data, success, fail, complete}) {
    wx.reLaunch(parseParams({name, data, success, fail, complete}))
  },

  /**
   * 跳转页面, 不能带 query 参数
   * @param {object} params {name, success, fail, complete}
   */
  switchTab({name, success, fail, complete}) {
    wx.switchTab(parseParams({name, success, fail, complete}))
  },

  /**
   * 返回上一级或多级页面
   * @param {object} params {delta, success, fail, complete}
   */
  back(params) {
    wx.navigateBack(params)
  },
}
