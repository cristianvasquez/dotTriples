import { createReadStream } from 'fs'
import { Transform } from 'stream'
import { DotTriples } from './transforms/dotTriples.js'
import { SetEntities } from './transforms/setEntities.js'
import { SimpleSplit } from './transforms/simpleSplit.js'
import { WrapSource } from './transforms/wrapSource.js'
import { uriResolver } from './uriResolver.js'

function createGetRDF(destStream){
  return new Transform({
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
}

export {createGetRDF}
