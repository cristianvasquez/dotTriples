import { Transform } from 'stream'

class WrapSource extends Transform {

  constructor (source, opts) {
    super({ ...opts, objectMode: true })
    this.source = source
  }

  _transform (chunk, encoding, callback) {
    this.push({
      content: chunk,
      source: this.source
    })
    callback()
  }

}

export { WrapSource }
