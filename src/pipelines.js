import { createReadStream } from 'fs'
import { resolve } from 'path'
import { Transform } from 'stream'
import { createMarkdownParser } from './markdownParser.js'
import { DetectEntities } from './transforms/detectEntities.js'
import { ParseDotTriples } from './transforms/parseDotTriples.js'
import { ParseMarkdown } from './transforms/parseMarkdown.js'
import { ProduceQuads } from './transforms/produceQuads.js'

// Expects markdown files, and produces triples
function createMarkdownPipeline ({ basePath, uriResolver }, destStream) {
  const markdownParser = createMarkdownParser()
  const transform = new Transform({
    objectMode: true, transform (path, enc, done) {
      const filePath = resolve(basePath, path)
      const fileStream = createReadStream(filePath).
        pipe(new ParseMarkdown({ markdownParser }, { path }, {})).
        pipe(new ParseDotTriples()).
        pipe(new DetectEntities({ uriResolver }, {})).
        pipe(new ProduceQuads({ uriResolver }, {}))

      fileStream.pipe(destStream, { end: false })
      fileStream.on('new', (item) => {
        console.log('item', item)
      })
      fileStream.on('error', done)
      fileStream.on('end', done)
    },
  })

  transform.on('error', () => {
    destStream.destroy()
  }).on('finish', () => {
    destStream.end()
  }).on('end', () => {
    destStream.end()
  })

  return transform
}

export { createMarkdownPipeline }
