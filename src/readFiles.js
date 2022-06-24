import { PassThrough, Transform } from 'stream'
import pkg from 'glob'

const { Glob } = pkg
import { createReadStream } from 'fs'
import { DotTriples } from './transforms/dotTriples.js'
import { SetEntities } from './transforms/setEntities.js'
import { SimpleSplit } from './transforms/simpleSplit.js'
import { WrapSource } from './transforms/wrapSource.js'
import { uriResolver } from './uriResolver.js'

function fromGlob (pattern) {

  const destStream = new PassThrough({
    objectMode: true,
    write (chunk, encoding, callback) {
      console.log(chunk)
      this.push(chunk)
      callback()
    }
  })

  const inputStream = new Transform({
    objectMode: true,
    transform (filename, enc, done) {
      console.log(`processing ${filename}`)
      const fileStream = createReadStream(filename)
        .pipe(new SimpleSplit('\n'))
        .pipe(new DotTriples())
        .pipe(new WrapSource(filename))
        .pipe(new SetEntities(uriResolver))

      fileStream.pipe(destStream, { end: false })
      fileStream.on('error', done)
      fileStream.on('end', done)
    }
  }).on('error', () => {
    destStream.destroy()
  }).on('finish', () => {
    destStream.end()
  })

  const search = new Glob(pattern,{nodir:true})
  search.on('match', filename => inputStream.write(filename))
  search.on('end', files => console.log(`[All Files] ${files}`))
  search.on('error', error => console.log(`[Error] ${error}`))
  search.on('abort', abort => console.log(`[Abort] ${abort}`))

  return destStream
}
export { fromGlob }
