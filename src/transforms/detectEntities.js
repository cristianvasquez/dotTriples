import { join, parse } from 'path'
import { Transform } from 'stream'
import { THIS, UNDEFINED } from '../consts.js'
import {
  MARKDOWN_LINKS_REGEXP,
  MEDIAWIKI_LINKS_REGEXP,
  URLS_REGEXP,
} from '../regexp.js'

class DetectEntities extends Transform {
  constructor ({ uriResolver }, opts) {
    super({ ...opts, objectMode: true })
    this.uriResolver = uriResolver
  }

  _transform (content, encoding, callback) {
    if (!content.exception) {

      const { header: { path }, subject, predicate, object } = content
      content.subject = setEntities(path, subject, this.uriResolver)
      content.predicate = setEntities(path, predicate, this.uriResolver)
      content.object = setEntities(path, object, this.uriResolver)
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

function getMarkdownLinks (text) {
  const internalLinks = []
  for (const match of text.matchAll(MARKDOWN_LINKS_REGEXP)) {
    internalLinks.push(match[1].substring(1, match[1].length - 1))
  }
  return internalLinks
}

function getInternalWikiLinks (text) {
  const internalLinks = []
  for (const match of text.matchAll(MEDIAWIKI_LINKS_REGEXP)) {
    internalLinks.push(match[1].substring(2, match[1].length - 2))
  }
  return internalLinks
}

function getURLs (text) {
  const result = text.match(URLS_REGEXP)
  return result ? result : []
}

function setEntities (path, term, uriResolver) {
  term.raw = trim(term.raw)
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
      uri: uriResolver.fallbackUris.undefinedProperty,
    })
  } else {

    if (typeof term.raw === 'string' || term.raw instanceof String) {
      for (const markdownLink of getMarkdownLinks(term.raw)) {
        // @TODO lookup rules that apply for absolute paths
        const { dir } = parse(path)
        const targetPath = join(dir, trim(markdownLink))
        const uri = uriResolver.getUriFromPath(targetPath)
        entities.push({
          uri:uri??uriResolver.fallbackUris.notFoundURI,
        })
      }
      for (const name of getInternalWikiLinks(term.raw)) {
        const uri = uriResolver.getUriFromName(trim(name))
        entities.push({
          uri:uri??uriResolver.fallbackUris.notFoundURI,
        })
      }
      for (const url of getURLs(term.raw)) {
        entities.push({
          uri: uriResolver.namedNode(url),
        })
      }
    }
  }

  if (entities.length) {
    term.entities = entities
  }

  return term
}

export { DetectEntities }
