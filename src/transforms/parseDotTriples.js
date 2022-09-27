import yaml from 'js-yaml'
import { Transform } from 'stream'
import {
  COMMENTED_DOTDOT,
  DOTDOT,
  RELATION_WITH_NO_TYPE,
  THIS,
} from '../consts.js'

const PLACEHOLDER = '5de1049b-559f-42e2-8279-ea0c7cfa8f40'

class ParseDotTriples extends Transform {
  constructor (opts) {
    super({ ...opts, objectMode: true })
  }

  pushNonTypedLinks ({ text, links }, header) {
    // Check if links were detected by previous transformers
    if (links && links.length) {
      this.push({
        header,
        links,
        raw: text,
        subject: { raw: THIS },
        predicate: { raw: RELATION_WITH_NO_TYPE },
        object: { raw: text },
      })
    }
  }

  pushPredicateObject ({ text, links }, { predicate, object }, header) {

    this.push({
      header,
      links,
      raw: text,
      subject: { raw: THIS },
      predicate: { raw: predicate },
      object: { raw: object },
    })
  }

  pushSubjectPredicateObject (
    { text, links }, { subject, predicate, object }, header) {

    this.push({
      header,
      links,
      raw: text,
      subject: { raw: subject },
      predicate: { raw: predicate },
      object: { raw: object },
    })
  }

  processPlainText ({ text, links }, header) {

    // description :: A personal preference, that spans many lines.
    const lines = text.split(DOTDOT).length === 2 ? [text] : text.split('\n')

    lines.forEach((line) => {
      // Just a hack for commented relations (TODO do this properly)
      const text = line.replaceAll(COMMENTED_DOTDOT, PLACEHOLDER)
      const chunks = text.split(DOTDOT).
        map(chunk => chunk.replaceAll(PLACEHOLDER, COMMENTED_DOTDOT))

      if (chunks.length === 1) {
        this.pushNonTypedLinks({ text, links }, header)
      } else if (chunks.length === 2) {
        this.pushPredicateObject({ text, links },
          { predicate: chunks[0], object: chunks[1] }, header)
      } else if (chunks.length === 3) {
        this.pushSubjectPredicateObject({ text, links },
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

  processYAML ({ value, links }, header) {
    try {
      const doc = yaml.load(value)
      for (const [key, value] of Object.entries(doc)) {
        if (Array.isArray(value)) {
          for (const object of value) {
            if (typeof object === 'string' || object instanceof String) {
              this.pushPredicateObject({ text: `${key}: ${value}`, links },
                { predicate: key, object },
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
          this.pushPredicateObject({ text: `${key}: ${value}`, links },
            { predicate: key, object: value }, header)
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

    const { header, type, text, value, links } = chunk

    if (type === 'yaml') {
      this.processYAML({ value, links }, header)
    } else if(type === 'code'){
      // @TODO implement something beautiful for turtle-publish
    } else {
      this.processPlainText({ text, links }, header)
    }
    callback()
  }
}

export { ParseDotTriples }
