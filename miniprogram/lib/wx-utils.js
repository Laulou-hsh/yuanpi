import retry from './retry'
import device from './device'
import {cutStart} from '../utils/string'

const MIN_SDK_VERSION = '2.3.0'
const CAN_I_USE = []

const WX_METHOD__SETTING_AUTH_SCOPE = {
  getUserInfo: 'userInfo',
  getLocation: 'userLocation',
  chooseLocation: 'userLocation',
  chooseAddress: 'address',
  chooseInvoiceTitle: 'invoiceTitle',
  chooseInvoice: 'invoice',
  getWeRunData: 'werun',
  startRecord: 'record',
  saveImageToPhotosAlbum: 'writePhotosAlbum',
  saveVideoToPhotosAlbum: 'writePhotosAlbum',
  camera: 'camera',
}

const SETTING_AUTH_SCOPE__NAME = {
  address: '通讯地址',
  camera: '摄像头',
  invoice: '获取发票',
  invoiceTitle: '发票抬头',
  record: '录音功能',
  userInfo: '用户信息',
  userLocation: '地理位置',
  werun: '微信运动步数',
  writePhotosAlbum: '保存到相册',
}

let isToasting = false // 全局 toast 时不 hideLoading, 防止真机上闪现 toast 被隐藏
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const addPrefix = (string, prefix) => (string.indexOf(prefix) === -1 ? prefix + string : string)
const cutPrefix = (string, prefix) => (!string.indexOf(prefix) ? string.substring(prefix.length) : string)

const wxUtils = {
  /**
   * wx.getStorageSync && wx.setStorageSync 有概率出错
   * 引入报错重试机制
   */
  getStorageSync: retry(key => wx.getStorageSync(key)),
  setStorageSync: retry((key, value) => wx.setStorageSync(key, value)),
  /**
   * 检查小程序登录态，微信 session_key 是否过期
   */
  checkSession: promisify('checkSession'),
  /**
   * 判断用户是否已经授权某种权限
   *    true 表示已授权
   *    false 表示已拒绝
   *    undefined 表示从未授权过
   *
   * @param {wx.Scope|string} scope
   * @return {Promise<boolean|undefined>}
   */
  getSetting: promisify('getSetting'),
  /**
   * 打开设置页面，用户返回小程序时，返回用户是否授权指定权限
   *    true 表示用户打开设置，返回时开启了授权
   *    false 表示用户打开设置，返回时关闭了授权
   *    undefined 表示用户打开设置，返回时未授权过指定权限（需要先调用 wx.authorize 去授权一次）
   *
   * @param {wx.Scope|string} scope
   * @return {Promise<boolean|undefined>}
   */
  openSetting(scope) {
    return promisify('openSetting')()
      .then(({authSetting: {[scope]: isAuth}}) => isAuth)
      .catch(() => false)
  },
  /**
   * 尝试请求授权并获取授权状态，只会返回 true or false 不会抛错
   *
   * @param {wx.Scope|string} scope
   * @return {Promise<boolean>}
   */
  authorize: promisify('authorize'),
  /**
   * @param method
   * @return {string|void}
   */
  getAuthSettingScope(method) {
    return addPrefix(WX_METHOD__SETTING_AUTH_SCOPE[method], 'scope.')
  },
  /**
   * @param scope
   * @return {string|void}
   */
  getAuthSettingScopeName(scope) {
    scope = cutPrefix(scope, 'scope.')
    return SETTING_AUTH_SCOPE__NAME[scope]
  },

  /**
   * 判断用户是否已经授权某种权限
   *    true 表示已授权
   *    false 表示已拒绝
   *    undefined 表示从未授权过
   *
   * @param {wx.Scope|string} scope
   * @return {Promise<boolean|undefined>}
   */
  getSettingScope(scope) {
    return wxUtils.getSetting().then(({authSetting: {[scope]: isAuth}}) => isAuth)
  },

  /**
   * 打开设置页面，用户返回小程序时，返回用户是否授权指定权限
   *    true 表示用户打开设置，返回时开启了授权
   *    false 表示用户打开设置，返回时关闭了授权
   *    undefined 表示用户打开设置，返回时未授权过指定权限（需要先调用 wx.authorize 去授权一次）
   *
   * @param {wx.Scope|string} scope
   * @return {Promise<boolean|undefined>}
   */
  openSettingAuthorize(scope) {
    return wxUtils.openSetting().then(({authSetting: {[scope]: isAuth}}) => isAuth)
  },

  /**
   * 请求用户授权权限
   *  1. 首次进入会有弹窗询问是否授权，用户授权成功返回 true
   *  2. 如果用户选了取消，或第二次进入页面，会再显示一个弹窗要求用户打开设置去开启
   *      如果用户在设置中开启并返回小程序页面，返回 true
   *      如果用户在弹窗上选了取消或在设置中并未开启返回了小程序页面，返回 false
   *
   * @param {wx.Scope|string} scope
   * @param modalOption
   * @return {Promise<boolean>}
   */
  async askSettingAuthorize(scope, modalOption = {}) {
    const isAuth = await wxUtils.getSettingScope(scope)
    if (isAuth) {
      return true
    } else if (isAuth === undefined) {
      // 这里表示之前从未授权过，系统会弹窗授权，如果拒绝，不再重复弹 modal 窗询问
      return wxUtils.tryAuthorize(scope)
    }

    const {confirm} = await wxUtils.showModal({
      title: '需要您的授权',
      content: '请在设置中开启' + SETTING_AUTH_SCOPE__NAME[cutStart(scope, 'scope.')],
      confirmText: '去开启',
      cancelText: '取消',
      ...modalOption,
    })
    if (!confirm) return false

    return wxUtils.openSettingAuthorize(scope)
  },

  /**
   * 尝试请求授权并获取授权状态，只会返回 true or false 不会抛错
   *
   * @param {wx.Scope|string} scope
   * @return {Promise<boolean>}
   */
  tryAuthorize(scope) {
    return wxUtils.authorize({scope}).catch(() => false)
  },

  /**
   * 调用 method，需要用户授予对应的 setting scope 权限，会自动弹窗去要求授权
   *    如果已授权，返回需要授权的方法的返回值
   *      （调用的方法是可能抛错的，注意 catch，比如用户在小程序设置中开了定位授权，但却关闭了系统的定位）
   *    如果未授权，返回 undefined
   *
   * @param {KeyOf<WX_METHOD__SETTING_AUTH_SCOPE_KEY_MAP>|string} method
   * @param {Object?} option
   * @param {Object?} modalOpt
   * @return {Promise<*|Error|void>}
   */
  async askSettingAuthorizeCall(method, option, modalOpt) {
    const scope = 'scope.' + WX_METHOD__SETTING_AUTH_SCOPE[method]
    const isAuth = await wxUtils.askSettingAuthorize(scope, modalOpt)
    return isAuth ? promisify(method)(option) : undefined
  },

  /**
   * 检查并提示小程序版本更新, 默认强制更新
   * @param {Boolean} showCancel 是否显示取消按钮
   */
  checkUpdateManager(showCancel = false) {
    if (!wx.getUpdateManager) return

    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(() => {
      wx.showModal({
        showCancel,
        title: '小程序更新提示',
        content: '新版本已下载，立即重启应用？',
        success: res => {
          if (res.confirm) updateManager.applyUpdate()
        },
      })
    })
  },

  checkSDKVersion() {
    const showTip = () => {
      wx.showModal({
        title: `升级提示！`,
        content: `您的小程序版本库 (v${device.getBaseLibVersion()}) 已过期，使用功能受限，请尽快升级微信。`,
        showCancel: false,
        confirmText: '知道了',
      })
    }

    if (this.compareVersion(device.getBaseLibVersion(), MIN_SDK_VERSION) < 0 || !CAN_I_USE.every(wx.canIUse)) {
      showTip()
    }
  },

  /**
   * 比较小程序基础库版本号
   */
  compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')

    const len = Math.max(v1.length, v2.length)
    while (v1.length < len) v1.push('0')
    while (v2.length < len) v2.push('0')

    for (let i = 0; i < len; i++) {
      const num1 = parseInt(v1[i], 10)
      const num2 = parseInt(v2[i], 10)
      if (num1 > num2) return 1
      if (num1 < num2) return -1
    }
    return 0
  },

  /**
   * 对请求进行 全屏 mask 的 loading 提示（达到 debounce 的效果）
   *
   * @param {function(): Promise<*>|Promise|string} title
   * @param {function(): Promise<*>|Promise?} handler
   * @return {Promise<*>|void}
   */
  maskLoading(title, handler) {
    if (!handler) {
      handler = title
      title = ''
    }

    wx.showLoading({title, mask: true})

    const result = typeof handler === 'function' ? handler() : handler
    if (!(result instanceof Promise)) {
      wx.showToast({title: '处理函数应返回 Promise', icon: 'none'})
      return
    }

    const hide = () => !isToasting && wx.hideLoading() // 不要影响执行过程中的 toast
    return result
      .then(() => {
        hide()
        return result
      })
      .catch(e => {
        hide()
        wx.showToast({title: e.message, icon: 'none'})
        throw e
      })
  },

  delay,

  async showToast(title, {icon = 'none', mask = true, duration = 1500, ...others} = {}) {
    isToasting = true
    wx.showToast({title, icon, mask, duration, ...others})
    await delay(duration)
    isToasting = false
  },
  /**
   * @see https://doc.minapp.com/js-sdk/wechat/wechat-decrypt.html
   * @param encryptedData
   * @param iv
   * @param {string} type
   * @return {Promise<*>}
   */
  // async decryptData(encryptedData, iv, type) {
  //   try {
  //     await this.checkSession()
  //   } catch (e) {
  //     this.showToast('授权过期，重新授权中...', {duration: 2000})
  //     try {
  //       await wx.BaaS.auth.logout()
  //       const isAuth = await wx.BaaS.auth.loginWithWechat(null)
  //       this.showToast(isAuth ? '完成授权，请继续' : '授权失败，请重试', {duration: 2000})
  //     } catch (err) {
  //       console.log(err)
  //       this.showToast('登录失败，请重试', {duration: 2000})
  //     }
  //     return
  //   }

  //   try {
  //     return wx.BaaS.wxDecryptData(encryptedData, iv, type)
  //   } catch (err) {
  //     // 失败的原因有可能是以下几种：用户未登录或 session_key 过期，微信解密插件未开启，提交的解密信息有误
  //     this.showToast('授权错误：' + err.message, {duration: 2000})
  //   }
  // },
  /**
   * @param encryptedData
   * @param iv
   * @return {Promise<{countryCode: string, phoneNumber: string, purePhoneNumber: string}|void>}
   */
  // decryptPhone(encryptedData, iv) {
  //   return this.decryptData(encryptedData, iv, 'phone-number')
  // },
  /**
   * @return {PromiseLike<WechatMiniprogram.GetLocationSuccessCallbackResult|WechatMiniprogram.GeneralCallbackResult>}
   */
  getLocation: promisify('getLocation'),
  /**
   * @param {wx.ChooseLocationOption} opt
   * @return {Promise<WechatMiniprogram.GetLocationSuccessCallbackResult|WechatMiniprogram.GeneralCallbackResult>}
   */
  chooseLocation: promisify('chooseLocation'),
  /**
   * @param {wx.ShowModalOption} opt
   * @return {Promise<WechatMiniprogram.ShowModalSuccessCallback|WechatMiniprogram.GeneralCallbackResult>}
   */
  showModal: promisify('showModal'),

  downloadFile: promisify('downloadFile'),

  request: promisify('request'),

  setDataPromise(data) {
    return new Promise(resolve => this.setData(data, resolve))
  },
}

/**
 * @param {string} method - wx.method
 * @return {function({}=): Promise<*>}
 */
function promisify(method) {
  return (opt = {}, ...restArgs) =>
    new Promise((resolve, reject) => {
      wx[method](
        {
          ...opt,
          success: resolve,
          fail: reject,
        },
        ...restArgs
      )
    })
}

export default wxUtils
