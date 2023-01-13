import { Transform } from 'stream'

class FromMarkdown extends Transform {
  constructor ({ triplifier, path, options }, opts) {
    super({ ...opts, objectMode: true })
    this.triplifier = triplifier
    this.options = options
    this.path = path
  }

  _transform (chunk, encoding, callback) {
    const text = chunk.toString()

    const pointer = this.triplifier.toRDF(text, { path: this.path },
      this.options)
    for (const quad of pointer.dataset) {
      this.push(quad)
    }
    callback()
  }
}

export { FromMarkdown }
