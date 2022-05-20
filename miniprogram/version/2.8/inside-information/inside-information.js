import config from '../../../config/config'

const { envList } = require('../../../envList');

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
      wx.showLoading({
        title: '加载中',
        mask: true,
      })
    },

    onShow() {
      this.getInsideInformation()
      const url = config.getCurrentPageUrl()
      this.setData({url})
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
      }).then(resp => {
        const imgs = []
        const {message} = resp.result.data[0]
        message.forEach(item => {
          imgs.push(item.img)
        })
        this.setData({content: resp.result.data[0], imgs})
        wx.setNavigationBarTitle({title: this.data.version + ' 内鬼消息'})
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        wx.hideLoading()
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
    },

    onShareAppMessage() {
      const {content, version, serial_number, url} = this.data
      return {
        title: content.title,
        path: url + `?version=${version}&serialNumber=${serial_number}`,
        imageUrl: content.message[0].img
      }
    },
  },
})