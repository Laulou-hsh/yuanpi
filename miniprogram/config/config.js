export const ROUTE = {
  NEWS: '/pages/news/news',
}

export default {
  getCurrentPageUrl() {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const url = `/${currentPage.route}`
    return url
  }
}
