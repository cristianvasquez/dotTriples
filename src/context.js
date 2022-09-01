import { once } from 'events'
import pkg from 'glob'
import { normalize, parse } from 'path'
import rdf from 'rdf-ext'

const { Glob } = pkg

const DEFAULT_SEARCH_PATTERN = './**/+(*.md|*.png|*.jpg|*.svg)'
const MARKDOWN_FILES = './**/+(*.md)'

function getNameFromPath (filePath) {
  const fileName = filePath.split('/').slice(-1)[0]
  return fileName.endsWith('.md')
    ? fileName.split('.').slice(0, -1).join('.')
    : fileName
}

function getUriFromPath (path) {
  return rdf.namedNode(
    `http://vault/entity/${encodeURIComponent(normalize(path))}`)
}

function buildPropertyFromText (text) {
  return rdf.namedNode(
    `http://vault/relation/${encodeURIComponent(
      text.replaceAll(' ', '-').toLowerCase())}`)
}

function getUriFromName (fullName, namesPaths) {

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

function createUriResolver (index) {
  const { namesPaths } = index
  return {
    namedNode: rdf.namedNode,
    literal: rdf.literal,
    buildPropertyFromText,
    undefinedProperty: rdf.namedNode('http://vault/relation/relatedTo'),
    getUriFromPath,
    getNameFromPath,
    getUriFromName: (name) => getUriFromName(name, namesPaths),
  }
}

async function createContext (basePath) {
  const index = await findFiles(basePath)
  const uriResolver = createUriResolver(index)
  return { basePath, index, uriResolver }
}

export { createContext, DEFAULT_SEARCH_PATTERN, MARKDOWN_FILES }
