import { Transform } from 'stream'
import { COMMENTED_DOTDOT, DOTDOT, THIS, UNDEFINED } from '../consts.js'
import { LINKS_REGEXP } from '../regexp.js'

const PLACEHOLDER = '5de1049b-559f-42e2-8279-ea0c7cfa8f40'

class DotTriples extends Transform {
  constructor (opts) {
    super({ ...opts, objectMode: true })
  }

  pushNonTypedLinks (text) {
    for (const match of text.matchAll(LINKS_REGEXP)) {
      this.push({
        raw: text,
        subject: { raw: THIS },
        predicate: { raw: UNDEFINED },
        object: { raw: match[1] }
      })
    }
  }

  _transform (chunk, encoding, callback) {
    const text = chunk.toString().replaceAll(COMMENTED_DOTDOT, PLACEHOLDER)
    const chunks = text.split(DOTDOT).map(chunk => chunk.replaceAll(PLACEHOLDER, COMMENTED_DOTDOT))

    if (chunks.length === 1) {
      this.pushNonTypedLinks(text)
    } else if (chunks.length === 2) {
      this.push({
        raw: text,
        subject: { raw: THIS },
        predicate: { raw: chunks[0] },
        object: { raw: chunks[1] }
      })
    } else if (chunks.length === 3) {
      this.push({
        raw: text,
        subject: { raw: chunks[0] },
        predicate: { raw: chunks[1] },
        object: { raw: chunks[2] }
      })
    } else if (chunks.length > 3) {
      this.push({
        raw: text,
        exception: 'ambiguous',
        subject: { raw: chunks[0] },
        predicate: { raw: chunks[1] },
        object: { raw: chunks.splice(2).join(DOTDOT) }
      })
    }
    callback()
  }
}

export { DotTriples }
