import { join, parse } from 'path'
import { Transform } from 'stream'
import { THIS, UNDEFINED } from '../consts.js'
import { hasUrl } from '../regexp.js'

class DetectEntities extends Transform {
  constructor ({ uriResolver }, opts) {
    super({ ...opts, objectMode: true })
    this.uriResolver = uriResolver
  }

  _transform (content, encoding, callback) {
    if (!content.exception) {

      const { header: { path }, subject, predicate, object, links } = content

      // This needs to change. It needs to create the triples right now.
      // The class must change to detect triples

      content.subject = detectEntities(path, subject, this.uriResolver, links)
      content.predicate = detectEntities(path, predicate, this.uriResolver, links)
      content.object = detectEntities(path, object, this.uriResolver, links)
      this.push(content)
    } else {
      // What to do when there is an exception?
    }

    callback()
  }
}

function trim (txt) {
  if (!txt.replace) {
    // Might be a number
    return txt
  }
  return txt.replace(/^\s+|\s+$/gm, '')
}

function detectEntities (path, term, uriResolver, links) {
  term.raw = trim(term.raw) // Remove  ::    leftover spaces -> 'leftover spaces'
  const entities = []
  if (term.raw === THIS) {
    const uri = uriResolver.getUriFromPath(path)
    const name = uriResolver.getNameFromPath(path)
    entities.push({
      uri: uri,
      name: name,
    })
    term.raw = `[[${name}]]`
  } else if (term.raw === UNDEFINED) {
    entities.push({
      uri: uriResolver.fallbackUris.hasUndefinedExternal,
    })
  } else {

    if (typeof term.raw === 'string' || term.raw instanceof String) {
      let text = term.raw

      for (const mediaWikiLink of links.filter(
        link => link.type === 'wikiLink')) {
        if (text.includes(mediaWikiLink.text)) {
          // A link to an [[Entity]]
          const uri = uriResolver.getUriFromName(mediaWikiLink.value)
          entities.push({
            uri: uri ?? uriResolver.fallbackUris.notFoundURI,
          })
          text.replaceAll(mediaWikiLink.text, '')
        }
      }

      for (const normalLink of links.filter(link => link.type === 'link' || link.type === 'image')) {
        if (text.includes(normalLink.text)) {
          const value = normalLink.url
          if (hasUrl(value)) {
            // [a link to a url](http://example.org)"
            entities.push({
              uri: uriResolver.namedNode(value),
            })
          } else {
            // [a link to an entity](./entity.md)
            const { dir } = parse(path)
            const targetPath = join(dir, trim(value))
            const uri = uriResolver.getUriFromPath(targetPath)
            entities.push({
              uri: uri ?? uriResolver.fallbackUris.notFoundURI,
            })
            text.replaceAll(normalLink.text, '')
          }

        }
      }
    }
  }

  if (entities.length) {
    term.entities = entities
  }

  return term
}

export { DetectEntities }
