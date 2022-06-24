import { PassThrough } from 'stream'
import pkg from 'glob'

const { Glob } = pkg
import { createDotTriplesInputStream } from './src/dotTriplesInputStream.js'

const destStream = new PassThrough({
  objectMode: true,
  write (chunk, encoding, callback) {
    console.log(chunk)
    this.push(chunk)
    callback()
  }
})
const inputStream = createDotTriplesInputStream(destStream)

const search = new Glob('*', { nodir: true })
search.on('match', filename => inputStream.write(filename))
search.on('end', files => console.log(`[All Files] ${files}`))
search.on('error', error => console.log(`[Error] ${error}`))
search.on('abort', abort => console.log(`[Abort] ${abort}`))
