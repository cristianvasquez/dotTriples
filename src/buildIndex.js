import pkg from 'glob'

const { Glob } = pkg
import { once } from 'events'

function getNameFromPath (filePath) {
  const fileName = filePath.split('/').slice(-1)[0]
  return fileName.endsWith('.md') ? fileName.split('.').slice(0, -1).join('.') : fileName
}

const DEFAULT_SEARCH_PATTERN = './**/+(*.md|*.png|*.jpg|*.svg)'

async function buildIndex (basePath, pattern = DEFAULT_SEARCH_PATTERN) {
  const namesPaths = new Map()
  const search = new Glob(pattern, {
    nodir: true,
    cwd: basePath
  })
  search.on('match', filePath => {
    const key = getNameFromPath(filePath)
    const paths = namesPaths.has(key) ? namesPaths.get(key) : new Set()
    paths.add(filePath)
    namesPaths.set(key, paths)
  })
  const files = (await once(search, 'end'))[0]
  return { namesPaths, files }
}

export { buildIndex, getNameFromPath, DEFAULT_SEARCH_PATTERN }
