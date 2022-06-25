import { createReadStream } from 'fs'
import { Transform } from 'stream'
import { DotTriples } from './transforms/dotTriples.js'
import { SetEntities } from './transforms/setEntities.js'
import { SimpleSplit } from './transforms/simpleSplit.js'
import { resolve} from 'path'

function createDotTriplesInputStream(context, destStream){
  return new Transform({
    objectMode: true,
    transform (path, enc, done) {
      // console.log(`processing ${filename}`)

      const filePath = resolve(context.basePath,path)

      const fileStream = createReadStream(filePath)
      .pipe(new SimpleSplit('\n'))
      .pipe(new DotTriples())
      .pipe(new SetEntities({path:filePath},context.uriResolver))

      fileStream.pipe(destStream, { end: false })
      fileStream.on('new', (item) => {
        console.log('item',item)
      })
      fileStream.on('error', done)
      fileStream.on('end', done)
    }
  }).on('error', () => {
    destStream.destroy()
  }).on('finish', () => {
    destStream.end()
  })
}

export {createDotTriplesInputStream}
