import {ROUTE} from '../../config/config'

// const app = getApp()
const { envList } = require('../../envList.js');

Page({
  data: {
    envList,
    selectedEnv: envList[0],
    swiperData: [],
    newsData: [],
  },

  onLoad() {
    wx.showLoading({title: ''})
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
      data: {type: 'getInsideInformationList'}
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
    if (news.inner && !news.foresight) {
      wx.navigateTo({url: `/version/${news.version}` + ROUTE.INSIDE_INFORMATION + `?version=${news.version}&serialNumber=${news.serial_number}`})
    } else if (!news.inner && news.foresight) {
      wx.navigateTo({url: `/version/${news.version}` + ROUTE.FORESIGHT + `?version=${news.version}&serialNumber=${news.serial_number}`})
    }

  },
});