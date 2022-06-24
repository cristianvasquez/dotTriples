import { Transform } from 'stream'

class SimpleSplit extends Transform {
  constructor (token, opts) {
    super({ ...opts })
    this.token = token
    this.tail = ''
  }

  _transform (chunk, encoding, callback) {
    const pieces = (this.tail + chunk).split(this.token)
    if (pieces.length > 1) {
      this.push(pieces.shift())
      this.tail = pieces.join(this.token)
    } else {
      this.tail = this.tail + chunk
    }
    callback()
  }

  _flush (callback) {
    for (const current of this.tail.split(this.token)) {
      this.push(current)
    }
    callback()
  }
}

export { SimpleSplit }
