import {ROUTE} from '../../config/config'

// const app = getApp()
const { envList } = require('../../envList.js');

Component({
  data: {
    envList,
    selectedEnv: envList[0],
    swiperData: [],
    newsData: [],
  },

  methods: {
    async onLoad() {
      wx.showLoading({title: ''})
      // const res = await wx.cloud.callContainer({
      //   path: "/get_number",
      //   method: "POST",
      //   data: {
      //     //如果你想传数据，在这里
      //   },
      //   header: {
      //     // 服务名字要在这里标明，可以针对于每个服务单独创建API类，具体按照自身业务实现
      //     'X-WX-SERVICE': 'aaa'
      //   },
      //   config: {
      //     // 微信云托管环境，注意不是云开发环境
      //     env: "prod-7gmywgq0e5d3cb1a"
      //   }
      // })
      // console.log(res)
      // this.setData({num: res.data.number})
    },
  
    onShow() {
      this.getSwiper()
      this.getInsideInformationList()
    },

    // 获取swiper
    getSwiper() {
      wx.cloud.callFunction({
        name: 'yuanpi',
        config: {
          env: this.data.selectedEnv.envId
        },
        data: {type: 'getSwiper'}
      }).then(resp => {
        if (resp.result.success) this.setData({haveCreateCollection: true})
        this.setData({swiperData: resp.result.data})
      }).catch(err => {
        console.log(err)
      })
    },

    // 获取信息列表
    getInsideInformationList() {
      wx.cloud.callFunction({
        name: 'yuanpi',
        config: {
          env: this.data.selectedEnv.envId
        },
        data: {type: 'getInsideInformationList', isShow: true}
      }).then(resp => {
        if(resp.result) this.setData({newsData: resp.result.data})
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        wx.hideLoading()
      })
    },

    toInsideInformation(e) {
      const {news} = e.currentTarget.dataset
      wx.navigateTo({url: ROUTE.NEWS + `?version=${news.version}&serialNumber=${news.serial_number}`})
    },

    onShareAppMessage() {
      return {
        title: '原批内鬼消息',
        path: '/pages/index/index',
        imageUrl: 'cloud://huangsihao-ax48l.6875-huangsihao-ax48l-1302513604/Index/index_2.6_tiny.png' || "https://6875-huangsihao-ax48l-1302513604.tcb.qcloud.la/Share/%E5%86%85%E9%AC%BC%E6%B6%88%E6%81%AF_tiny.png?sign=93bfa176fb94dcaa8a0e402241427288&t=1653382081"
      }
    },
  }
});
