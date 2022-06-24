import { Transform } from 'stream'
import { THIS } from '../consts.js'

class SetEntities extends Transform {
  constructor (uriResolver, opts) {

    super({ ...opts, objectMode: true })
    this.uriResolver = uriResolver
  }

  _transform (chunk, encoding, callback) {
    const { source, content } = chunk
    if (!content.exception) {
      content.subject = setEntities(source, content.subject, this.uriResolver)
      content.predicate = setEntities(source, content.predicate, this.uriResolver)
      content.object = setEntities(source, content.object, this.uriResolver)
      this.push({ source, content })
    }

    callback()
  }
}

function trim (txt) {
  return txt.replace(/^\s+|\s+$/gm, '')
}

const LINKS_REGEXP = /(\[\[[^\]\n]*\]\])/g

function getInternalLinks (text) {
  const internalLinks = []
  for (const match of text.matchAll(LINKS_REGEXP)) {
    internalLinks.push(match[1].substring(2, match[1].length - 2))
  }
  return internalLinks
}

function setEntities (source, term, uriResolver) {
  term.raw = trim(term.raw)
  const entities = []
  if (term.raw === THIS) {
    const uri = uriResolver.uriFromSource(source)
    const name = uriResolver.nameFromSource(source)
    entities.push({
      uri: uri,
      name: name
    })
    term.raw = `[[${name}]]`
  } else {
    for (const name of getInternalLinks(term.raw)) {
      const uri = uriResolver.uriFromName(name)
      entities.push({
        uri: uri,
        name: name
      })
    }
  }

  if (entities.length) {
    term.entities = entities
  }

  return term
}

export { SetEntities }
