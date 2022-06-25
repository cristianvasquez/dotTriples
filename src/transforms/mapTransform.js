import { Transform } from 'stream'

class MapTransform extends Transform {

  constructor (map = (chunk) => chunk, opts) {
    super({ ...opts, objectMode: true })
    this.map = map
  }

  _transform (chunk, encoding, callback) {
    this.push(this.map(chunk))
    callback()
  }

}

export { MapTransform }
