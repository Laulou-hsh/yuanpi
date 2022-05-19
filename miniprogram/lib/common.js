/**
 * @param {number} ms
 * @return {Promise<void>}
 */
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))