const { envList } = require('../../../envList');

Component({
  data: {
    envList,
    selectedEnv: envList[0],
    priority: null,
    content: {},
    imgs: [],
  }, 

  methods: {
    onLoad(options) {
      const {priority} = options
      this.setData({priority: Number(priority)})
      wx.showLoading({
        title: '加载中',
        mask: true,
      })
    },

    onShow() {
      this.getInsideInformation()
    },

    // 获取信息
    getInsideInformation() {
      wx.cloud.callFunction({
        name: 'yuanpi',
        config: {
          env: this.data.selectedEnv.envId
        },
        data: {type: 'getInsideInformation', priority: this.data.priority}
      }).then(resp => {
        const imgs = []
        const {message} = resp.result.data[0]
        message.forEach(item => {
          imgs.push(item.img)
        })
        this.setData({content: resp.result.data[0], imgs})
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
  },
})