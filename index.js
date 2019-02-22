'use strict'

// const defaults = require('defaults')

const {
  isRegExp,
  getDirData,
  getExt,
  getStats,
  getName,
  normalize,
  join,
  realPath
} = require('./libs/utils')

const constants = {
  DIRECTORY: 'directory',
  FILE: 'file'
}
async function treeJson (path, options, myLevel) {
  options = {
    level: 20,
    onlyDir: false,
    showHiddenFiles: false,
    ...options
  }
  if (!myLevel) {
    myLevel = 0
  }
  const { level, exclude, extensions, onlyDir, showHiddenFiles } = options
  if (level <= 0) throw new Error('Level invalid should to be > 0')
  if (level === myLevel) {
    return false
  }
  path = normalize(path)
  const name = getName(path)
  if (exclude) {
    const excludes = isRegExp(exclude) ? [exclude] : exclude
    if (excludes.some((exclusion) => exclusion.test(name))) {
      return false
    }
  }
  const item = { path, name }
  if (name.charAt(0) === '.' && !showHiddenFiles) {
    return false
  }
  let stats

  try { stats = await getStats(path) } catch (e) {
    if (myLevel === 0) throw e
    return false
  }

  item.size = stats.size
  item.isSymbolicLink = stats.isSymbolicLink()
  item.createAt = stats.birthtime
  item.updateAt = stats.mtime
  if (item.isSymbolicLink) {
    item.realPath = realPath(path)
  }
  if (stats.isFile()) {
    if (onlyDir) return false
    const ext = getExt(path)
    if (ext.length > 0 && extensions && isRegExp(extensions) && !extensions.test(ext)) return false
    item.extension = ext
    item.type = constants.FILE
  }
  if (stats.isDirectory()) {
    let dirData = await getDirData(path)
    if (dirData === null) return false
    const level = myLevel + 1
    item.type = constants.DIRECTORY
    item.children = []

    for (let i = 0; i < dirData.length; i++) {
      const child = dirData[i]
      const data = await treeJson(join(path, child), options, level)
      if (data) item.children.push(data)
    }
    item.size = item.children.reduce((prev, child) => prev + child.size, 0)
  }
  return item
}


module.exports = { treeJson }
