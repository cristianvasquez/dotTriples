import { createReadStream } from 'fs'
import { resolve } from 'path'
import { Transform } from 'stream'
import { createMarkdownParser } from './markdownParser.js'
import { DotTriples } from './transforms/dotTriples.js'
import { ParseMarkdown } from './transforms/parseMarkdown.js'
import { SetEntities } from './transforms/setEntities.js'

// Expects markdown files, and produces triples
function createMarkdownPipeline ({ basePath, uriResolver }, destStream) {
  const markdownParser = createMarkdownParser()
  return new Transform({
    objectMode: true, transform (path, enc, done) {

      const filePath = resolve(basePath, path)
      const fileStream = createReadStream(filePath).
        pipe(new ParseMarkdown({ markdownParser }, { path }, {})).
        pipe(new DotTriples()).
        pipe(new SetEntities({ uriResolver }, {}))

      fileStream.pipe(destStream, { end: false })
      fileStream.on('new', (item) => {
        console.log('item', item)
      })
      fileStream.on('error', done)
      fileStream.on('end', done)
    },
  }).on('error', () => {
    destStream.destroy()
  }).on('finish', () => {
    destStream.end()
  })
}

export { createMarkdownPipeline }
