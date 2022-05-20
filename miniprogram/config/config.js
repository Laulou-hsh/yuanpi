export const ROUTE = {
  FORESIGHT: '/foresight/foresight',
  INSIDE_INFORMATION: '/inside-information/inside-information',
}

export default {
  getCurrentPageUrl() {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const url = `/${currentPage.route}`
    return url
  }
}
