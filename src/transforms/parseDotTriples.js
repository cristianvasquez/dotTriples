import yaml from 'js-yaml'
import { Transform } from 'stream'
import { COMMENTED_DOTDOT, DOTDOT, THIS, UNDEFINED } from '../consts.js'
import { LINKS_REGEXP } from '../regexp.js'

const PLACEHOLDER = '5de1049b-559f-42e2-8279-ea0c7cfa8f40'

class ParseDotTriples extends Transform {
  constructor (opts) {
    super({ ...opts, objectMode: true })
  }

  pushNonTypedLinks (text, header) {
    for (const match of text.matchAll(LINKS_REGEXP)) {
      this.push({
        header,
        raw: text,
        subject: { raw: THIS },
        predicate: { raw: UNDEFINED },
        object: { raw: match[1] },
      })
    }
  }

  pushPredicateObject (text, { predicate, object }, header) {

    this.push({
      header,
      raw: text,
      subject: { raw: THIS },
      predicate: { raw: predicate },
      object: { raw: object },
    })
  }

  pushSubjectPredicateObject (text, { subject, predicate, object }, header) {

    this.push({
      header,
      raw: text,
      subject: { raw: subject },
      predicate: { raw: predicate },
      object: { raw: object },
    })
  }

  processPlainText (txt, header) {
    txt.split('\n').forEach((line) => {
      // Just a hack for commented relations (TODO do this properly)
      const text = line.replaceAll(COMMENTED_DOTDOT, PLACEHOLDER)
      const chunks = text.split(DOTDOT).
        map(chunk => chunk.replaceAll(PLACEHOLDER, COMMENTED_DOTDOT))

      if (chunks.length === 1) {
        this.pushNonTypedLinks(text, header)
      } else if (chunks.length === 2) {
        this.pushPredicateObject(text,
          { predicate: chunks[0], object: chunks[1] }, header)
      } else if (chunks.length === 3) {
        this.pushSubjectPredicateObject(text,
          { subject: chunks[0], predicate: chunks[1], object: chunks[2] },
          header)
      } else if (chunks.length > 3) {
        this.push({
          header,
          exception: 'ambiguous',
          data: text,
        })
      }
    })
  }

  processYAML (value, header) {
    try {
      const doc = yaml.load(value)
      for (const [key, value] of Object.entries(doc)) {
        if (Array.isArray(value)) {
          for (const object of value) {
            if (typeof object === 'string' || object instanceof String) {
              this.pushPredicateObject(`${key}: ${value}`, { predicate:key, object },
                header)
            } else {
              this.push({
                header,
                exception: 'unhandled',
                data: object,
              })
            }
          }
        } else {
          this.pushPredicateObject(`${key}: ${value}`, { predicate:key, object:value }, header)
        }
      }
    } catch (e) {
      this.push({
        header,
        exception: 'invalid-yaml',
        data: e,
      })
    }
  }

  _transform (chunk, encoding, callback) {

    const { header, type, text, value } = chunk

    if (type === 'yaml') {
      this.processYAML(value, header)
    } else {
      this.processPlainText(text, header)
    }
    callback()
  }
}

export { ParseDotTriples }
