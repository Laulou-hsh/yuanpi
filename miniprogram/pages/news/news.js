import config from '../../config/config'
import wxUtils from '../../lib/wx-utils'

const { envList } = require('../../envList');

Component({
  data: {
    envList,
    selectedEnv: envList[0],
    serial_number: null,
    content: {},
    imgs: [],
  }, 

  methods: {
    onLoad(options) {
      const {serialNumber, version} = options
      this.setData({serial_number: Number(serialNumber), version : Number(version)})
      wx.showLoading({title: '加载中', mask: true})
    },

    onShow() {
      this.getInsideInformation()
      const url = config.getCurrentPageUrl()
      this.setData({url})
    },

    onReady() {
      this.videoContext = wx.createVideoContext('inner')
    },

    // 获取信息
    getInsideInformation() {
      const {serial_number, version} =this.data
      wx.cloud.callFunction({
        name: 'yuanpi',
        config: {
          env: this.data.selectedEnv.envId
        },
        data: {type: 'getInsideInformation', serial_number, version}
      }).then(async resp => {
        const imgs = []
        const content = resp.result.data[0]
        const result = await wxUtils.request({url: content.json})
        const {message} = result.data
        message.forEach(item => {
          if (item.img) imgs.push(item.img)
        })
        this.setData({content, imgs, message})
        wx.setNavigationBarTitle({title: this.data.version + `${content.inner ? ' 内鬼消息' : ' 前瞻消息'}`})
        wx.hideLoading()
      }).catch(err => {
        console.log(err)
        wx.hideLoading()
        wxUtils.showToast('加载错误，请稍后重试')
      })
    },

    previewImage(e) {
      const {img} = e.currentTarget.dataset
      const {imgs} = this.data
      wx.previewImage({
        current: img,
        urls: imgs,
        showmenu: true,
      })
      this.bindPlayVideo()
    },

    bindPlayVideo() {
      this.videoContext.pause()
    },

    onShareAppMessage() {
      const {content, version, serial_number, url} = this.data
      return {
        title: content.title,
        path: url + `?version=${version}&serialNumber=${serial_number}`,
        imageUrl: content.message[0].img || "https://6875-huangsihao-ax48l-1302513604.tcb.qcloud.la/Share/%E5%86%85%E9%AC%BC%E6%B6%88%E6%81%AF_tiny.png?sign=93bfa176fb94dcaa8a0e402241427288&t=1653382081"
      }
    },
  },
})