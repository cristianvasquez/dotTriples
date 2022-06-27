import { createReadStream } from 'fs'
import { resolve } from 'path'
import { PassThrough, Transform } from 'stream'
import { DotTriples } from './transforms/dotTriples.js'
import { Markdown } from './transforms/markdown.js'
import { SetEntities } from './transforms/setEntities.js'
import { createUriResolver } from './uriResolver.js'
import { createMarkdownParser } from './markdownParser.js'

function createTestStream (context, destStream) {
  return new Transform({
    objectMode: true,
    transform (path, enc, done) {
      // console.log(`processing ${filename}`)

      const filePath = resolve(context.basePath, path)

      const fileStream = createReadStream(filePath)
      .pipe(new Markdown(context.markdownParser))
      .pipe(new DotTriples())
      .pipe(new SetEntities({ path: filePath }, context.uriResolver))

      fileStream.pipe(destStream, { end: false })
      fileStream.on('new', (item) => {
        console.log('item', item)
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


const destStream = new PassThrough({
  objectMode: true,
  write (chunk, encoding, callback) {
    console.log(JSON.stringify(chunk, null, 2))
    this.push(chunk)
    callback()
  }
})

const transform = createTestStream({
  basePath: '../test/markdown/',
  uriResolver: createUriResolver(),
  markdownParser: createMarkdownParser()
}, destStream)

transform.write('hello.md')
transform.write('Person.md')
