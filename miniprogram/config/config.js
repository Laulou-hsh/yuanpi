export const ROUTE = {
  FORESIGHT: '/pages/foresight/foresight',
  INSIDE_INFORMATION: '/pages/inside-information/inside-information',
}

export default {
  getCurrentPageUrl() {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const url = `/${currentPage.route}`
    return url
  }
}
