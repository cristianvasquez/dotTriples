import { Transform } from 'stream'
import { COMMENTED_DOTDOT, DOTDOT, THIS } from '../consts.js'

const PLACEHOLDER = '5de1049b-559f-42e2-8279-ea0c7cfa8f40'

class DotTriples extends Transform {
  constructor (opts) {
    super({ ...opts, objectMode: true })
  }

  _transform (chunk, encoding, callback) {
    const text = chunk.toString().replaceAll(COMMENTED_DOTDOT, PLACEHOLDER)
    const chunks = text.split(DOTDOT).map(chunk => chunk.replaceAll(PLACEHOLDER, COMMENTED_DOTDOT))

    if (chunks.length === 2) {
      this.push({
        raw: text,
        subject: {
          raw: THIS
        },
        predicate: {
          raw: chunks[0]
        },
        object: {
          raw: chunks[1]
        }
      })
    } else if (chunks.length === 3) {
      this.push({
        raw: text,
        subject: {
          raw: chunks[0]
        },
        predicate: {
          raw: chunks[1]
        },
        object: {
          raw: chunks[2]
        }
      })
    } else if (chunks.length > 3) {
      this.push({
        raw: text,
        exception: 'ambiguous'
      })
    }
    callback()
  }
}

export { DotTriples }
