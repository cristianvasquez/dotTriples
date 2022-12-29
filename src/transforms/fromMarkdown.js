import { toRdf } from 'rdf-from-markdown'
import { Transform } from 'stream'

class FromMarkdown extends Transform {
  constructor ({ triplifier, path }, opts) {
    super({ ...opts, objectMode: true })
    this.triplifier = triplifier
    this.path = path
  }

  _transform (chunk, encoding, callback) {
    const text = chunk.toString()

    const pointer = this.triplifier.toRdf(text, { path: this.path })
    for (const quad of pointer.dataset) {
      this.push(quad)
    }
    callback()
  }
}

export { FromMarkdown }
