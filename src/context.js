import { once } from 'events'
import pkg from 'glob'
import { normalize, parse } from 'path'
import rdf from 'rdf-ext'

const { Glob } = pkg

const DEFAULT_SEARCH_PATTERN = './**/+(*.md|*.png|*.jpg|*.svg)'

function getNameFromPath (filePath) {
  const fileName = filePath.split('/').slice(-1)[0]
  return fileName.endsWith('.md')
    ? fileName.split('.').slice(0, -1).join('.')
    : fileName
}

function getUriFromPath (path) {
  return rdf.namedNode(`http://vault/${normalize(path)}`)
}

function createUriResolver (index) {
  const { namesPaths } = index
  return {
    namedNode: rdf.namedNode,
    undefinedProperty: rdf.namedNode('http://vault/relatedTo'),
    uriFromPath: getUriFromPath,
    nameFromPath: getNameFromPath,
    uriFromName: (fullName) => {

      const { dir, name, ext } = parse(fullName)
      let uri = undefined
      if (dir) {
        // Obsidian's way.
        // If the label does not contain a path, it's unique.
        // It's an absolute path, we don't look up
        const path = `${name}${ext ?? '.md'}`  // Normally .md are omitted
        uri = getUriFromPath(path)
      } else if (namesPaths.has(name)) {
        // we look up otherwise
        const [path] = namesPaths.get(name)
        uri = getUriFromPath(path)
      } else {
        // console.log(`Warning, [${fullName}] not found`)
      }

      return uri
    },
  }
}

async function findFiles (basePath, pattern = DEFAULT_SEARCH_PATTERN) {
  const namesPaths = new Map()
  const search = new Glob(pattern, {
    nodir: true, cwd: basePath,
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

async function createContext (basePath) {
  const index = await findFiles(basePath)
  const uriResolver = createUriResolver(index)
  return { basePath, index, uriResolver }
}

export { createContext, DEFAULT_SEARCH_PATTERN }
