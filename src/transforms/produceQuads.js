import { join, parse } from 'path'
import rdf from 'rdf-ext'
import { Transform } from 'stream'
import { RELATION_WITH_NO_TYPE, THIS } from '../consts.js'
import { hasUrl } from '../regexp.js'
import { isString, trim } from '../text/stringUtils.js'

class ProduceQuads extends Transform {
  constructor ({ uriResolver }, opts) {
    super({ ...opts, objectMode: true })
    this.uriResolver = uriResolver
  }

  getTerm ({ entity, path, fallbackAsLiteral = false }) {
    if (entity.token === THIS) {
      return this.uriResolver.getUriFromPath(path) ?? this.uriResolver.fallbackUris.notFoundURI
    }
    if (entity.type === 'internalNameLink') {
      return this.uriResolver.getUriFromName(entity.name) ?? this.uriResolver.fallbackUris.notFoundURI
    }
    if (entity.type === 'internalPathLink') {
      return this.uriResolver.getUriFromPath(entity.path) ?? this.uriResolver.fallbackUris.notFoundURI
    }
    if (entity.type === 'externalLink') {
      return this.uriResolver.namedNode(entity.url)
    }

    if (entity.raw) {
      return fallbackAsLiteral
        ? this.uriResolver.literal(trim(entity.raw))
        : this.uriResolver.buildPropertyFromText(trim(entity.raw))
    }

    console.error('could not interpret', entity)
    throw Error('Cannot interpret')
  }

  withFallback (uri) {
    return uri ? uri : this.uriResolver.fallbackUris.notFoundURI
  }

  _transform (content, encoding, callback) {
    if (!content.exception) {

      const { header: { path, counter }, subject, predicate, object, links } = content

      // console.log('links',links)

      const inSubject = getEntities({ path, raw: subject.raw, links })
      const inPredicate = getEntities({ path, raw: predicate.raw, links })
      const inObject = getEntities({ path, raw: object.raw, links })

      const namedGraph = rdf.namedNode(`${this.uriResolver.getUriFromPath(path).value}/${counter}`)

      if (content.raw && content.raw !== '') {
        // Subjects and predicates are always URIs, Objects can be either URI or Literal
        for (const s of inSubject) {
          for (const p of inPredicate) {
            for (const o of inObject) {
              // console.log(s, p, o, content)
              const subjectTerm = this.getTerm({ entity: s, path })

              let predicateTerm = ''
              if (p.token === RELATION_WITH_NO_TYPE) {
                if (o.type === 'externalLink') {
                  predicateTerm = this.uriResolver.fallbackUris.noTypeExternal
                } else if (o.type === 'internalNameLink' || o.type ===
                  'internalPathLink') {
                  predicateTerm = this.uriResolver.fallbackUris.noTypeInternal
                } else {
                  predicateTerm = this.uriResolver.fallbackUris.noType
                }
              } else {
                predicateTerm = this.getTerm({ entity: p, path })
              }

              const objectTerm = this.getTerm(
                { entity: o, path, fallbackAsLiteral: true })

              // objects can be literal or namedNodes, however if p is RELATION_WITH_NO_TYPE, I don't allow literals
              const validQuad = !(p.token === RELATION_WITH_NO_TYPE && objectTerm.termType === 'Literal')

              if (validQuad) {
                const quad = rdf.quad(this.withFallback(subjectTerm),
                  this.withFallback(predicateTerm),
                  this.withFallback(objectTerm),
                  namedGraph)
                this.push(quad)
              }

            }
          }
        }
      }

    } else {
      // What to do when there is an exception?
    }

    callback()
  }
}

function getEntities ({ path, raw, links }) {
  const entities = []
  if (!isString(raw)) {
    return entities
  }
  let text = trim(raw)
  if (text.includes(THIS)) {
    entities.push({
      token: THIS,
    })
    text.replaceAll(THIS, '')
  }

  if (text.includes(RELATION_WITH_NO_TYPE)) {
    entities.push({
      token: RELATION_WITH_NO_TYPE,
    })
    text.replaceAll(RELATION_WITH_NO_TYPE, '')
  }

  for (const mediaWikiLink of links.filter(
    link => link.type === 'wikiLink')) {
    if (text.includes(mediaWikiLink.text)) {
      entities.push({
        type: 'internalNameLink',
        name: mediaWikiLink.value,
      })
      text.replaceAll(mediaWikiLink.text, '')
    }
  }

  for (const link of links.filter(
    link => link.type === 'link' || link.type === 'image')) {
    if (text.includes(link.url)) {
      if (hasUrl(link.url)) {
        // [a link to a url](http://example.org)"
        entities.push({
          type: 'externalLink',
          url: link.url,
        })
      } else {
        // [a link to an entity](./entity.md)
        const { dir } = parse(path)
        const targetPath = join(dir, trim(link.url))
        entities.push({
          type: 'internalPathLink',
          path: targetPath,
        })
        text.replaceAll(link.url, '')
      }
    }
  }

  if (entities.length) {
    return entities
  }

  return [{ raw }]
}

export { ProduceQuads }
