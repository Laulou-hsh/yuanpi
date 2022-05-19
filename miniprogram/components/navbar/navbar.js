import device from '../../lib/device'
import router from '../../lib/router'
import {delay} from '../../lib/common'
import {toCamelCase} from '../../utils/string'

Component({
  externalClasses: ['container-class'],

  properties: {
    // 是否显示 navbar
    active: {
      type: Boolean,
      value: true,
    },
    // 是否 fixed
    isFixed: {
      type: Boolean,
      value: false,
    },
    // 显示返回按钮
    showBackBtn: {
      type: Boolean,
      value: true,
    },
    // 状态栏文字、返回箭头、右侧胶囊的颜色，仅支持 black 和 white
    frontColor: {
      type: String,
      value: 'black',
    },
    // 返回首页按钮颜色，仅支持 black 和 white
    homeColor: {
      type: String,
      value: 'black',
    },
    // navbar 的 container 元素是否占位
    placeholder: {
      type: Boolean,
      value: true,
    },

    title: {
      type: String,
      value: '',
    },

    titleColor: {
      type: String,
      value: 'black',
    },

    backgroundColor: {
      type: String,
      value: '#ffffff',
    },

    whiteArraw: {
      type: Boolean,
      value: false,
    },

    backgroundImage: {
      type: String,
      value: '',
    },

    iconBack: {
      type: String,
      value: 'white',
    },

    /**
     * @property {WechatMiniprogram.AnimationOption.duration} fadeDuration
     */
    fadeDuration: {
      type: Number,
      value: 300,
    },

    /**
     * @property {'linear'|'ease-in'|'ease-out'|'none'} fadeTimingFunc
     */
    fadeTimingFunc: {
      type: String,
      value: 'ease-out',
    },

    backAgent: {
      type: Boolean,
      value: false,
    },

    onlyShowBtn: {
      type: Boolean,
      value: false,
    },
  },

  observers: {
    frontColor() {
      this.updateWxNavBarNextTick()
    },
  },

  attached() {
    const pages = getCurrentPages()
    const {active, titleColor, frontColor, backgroundColor, backgroundImage} = this.data

    this.setData({
      active,
      titleColor,
      frontColor,
      backgroundColor,
      backgroundImage,
      statusBarHeight: device.getStatusBarHeight(),
      navBarHeight: device.getNavbarHeight(),
      showHomeBtn: pages.length === 1 && !pages[0].route.endsWith('pages/index/index'),
    })

    this.updateWxNavBarNextTick()
  },

  methods: {
    navBack() {
      if (this.data.backAgent) {
        this.triggerEvent('back')
        return
      }

      router.back()
    },
    navToIndex() {
      let {route: currentPath} = getCurrentPages()[0]
      currentPath = currentPath.split('/')
      currentPath.splice(-2, 2, 'index', 'index')
      wx.redirectTo({
        url: '/' + currentPath.join('/'),
      })
    },

    updateWxNavBarNextTick() {
      delay(0).then(() => {
        const {frontColor, backgroundColor, fadeDuration, fadeTimingFunc} = this.data
        wx.setNavigationBarColor({
          frontColor: frontColor === 'black' ? '#000000' : '#ffffff',
          backgroundColor,
          animation: {
            duration: fadeDuration,
            timingFunc: toCamelCase(fadeTimingFunc),
          },
        })
      })
    },
  },
})
