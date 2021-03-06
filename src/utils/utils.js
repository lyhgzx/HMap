/**
 * Created by FDD on 2017/9/18.
 * @desc 工具类
 */
/**
 * 首字母大写(其他小写)
 * @param str
 * @returns {string}
 */
export const firstUpperToCase = (str) => {
  return (str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase()))
}
/**
 * 只转换第一个字母
 * @param str
 */
export const upperFirstChart = str => {
  return (str.replace(/( |^)[a-z]/g, (L) => L.toUpperCase()))
}

/**
 * 去除字符串前后空格
 * @param str
 * @returns {*}
 */
export const trim = (str) => {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '')
}

/**
 * 判断是否为对象
 * @param value
 * @returns {boolean}
 */
export const isObject = value => {
  const type = typeof value
  return value !== null && (type === 'object' || type === 'function')
}

/**
 * 判断是否为字符串
 * @param value
 * @returns {boolean}
 */
export const isString = value => {
  const type = typeof value
  return type === 'string'
}
