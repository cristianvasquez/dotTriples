import { createReadStream, stat } from 'fs'
import { resolve } from 'path'
import rdf from 'rdf-ext'
import { Transform } from 'stream'
import { createMarkdownParser } from './markdownParser.js'
import ns from './namespaces.js'
import { ParseDotTriples } from './transforms/parseDotTriples.js'
import { ParseMarkdown } from './transforms/parseMarkdown.js'
import { ProduceQuads } from './transforms/produceQuads.js'

function defaultStatsToQuads ({ fileUri, path, name, stats }) {
  const { size, atime, mtime, ctime } = stats
  return [
    rdf.quad(fileUri, ns.dot.path, rdf.literal(path)),
    rdf.quad(fileUri, ns.dot.name, rdf.literal(name)),
    rdf.quad(fileUri, ns.dot.size, rdf.literal(size, ns.xsd.integer)),
    rdf.quad(fileUri, ns.dot.atime,
      rdf.literal(atime.toISOString(), ns.xsd.dateTime)),
    rdf.quad(fileUri, ns.dot.mtime,
      rdf.literal(mtime.toISOString(), ns.xsd.dateTime)),
    rdf.quad(fileUri, ns.dot.ctime,
      rdf.literal(ctime.toISOString(), ns.xsd.dateTime)),
  ]
}

// Expects markdown files, and produces triples
function createMarkdownPipeline ({
  basePath,
  uriResolver,
  quadProducers,
  statsToQuads = defaultStatsToQuads,
  callback = () => {},
}, destStream) {

  const markdownParser = createMarkdownParser()
  const transform = new Transform({
    objectMode: true, transform (path, enc, done) {

      const filePath = resolve(basePath, path)

      stat(filePath, (err, stats) => {
        if (err) {
          console.error(err)
        } else {
          const fileStream = createReadStream(filePath).
            pipe(new ParseMarkdown({ markdownParser }, { path }, {})).
            pipe(new ParseDotTriples()).
            pipe(new ProduceQuads({ uriResolver, quadProducers }, {}))

          fileStream.pipe(destStream, { end: false })
          fileStream.on('error', done)
          fileStream.on('end', () => {
            const fileUri = uriResolver.getUriFromPath(path)
            const name = uriResolver.getNameFromPath(path)
            for (const quad of statsToQuads({ fileUri, path, name, stats })) {
              destStream.write(quad)
            }
            callback(path)
            done()
          })
        }
      });
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
