import { createReadStream, stat } from 'fs'
import { resolve } from 'path'
import rdf from 'rdf-ext'
import { PassThrough, Transform } from 'stream'
import { createMarkdownParser } from './markdownParser.js'
import ns from './namespaces.js'
import { ParseDotTriples } from './transforms/parseDotTriples.js'
import { ParseMarkdown } from './transforms/parseMarkdown.js'
import { ProduceQuads } from './transforms/produceQuads.js'

function defaultStatsToQuads ({ fileUri, path, name, stats }) {
  const { size, atime, mtime, ctime } = stats
  return [
    rdf.quad(fileUri, ns.dot.path, rdf.literal(path), fileUri),
    rdf.quad(fileUri, ns.dot.name, rdf.literal(name), fileUri),
    rdf.quad(fileUri, ns.dot.size, rdf.literal(size, ns.xsd.integer), fileUri),
    rdf.quad(fileUri, ns.dot.atime,
      rdf.literal(atime.toISOString(), ns.xsd.dateTime), fileUri),
    rdf.quad(fileUri, ns.dot.mtime,
      rdf.literal(mtime.toISOString(), ns.xsd.dateTime), fileUri),
    rdf.quad(fileUri, ns.dot.ctime,
      rdf.literal(ctime.toISOString(), ns.xsd.dateTime), fileUri),
  ]
}

// Expects markdown files, and produces datasets
function createMarkdownPipeline ({
  basePath,
  uriResolver,
  datasetMappers = [],
  statsToQuads = defaultStatsToQuads,
}, { outputStream, callback }) {

  if (!(outputStream || callback)) {
    throw Error('outputStream stream and/or callback is required')
  }

  const markdownParser = createMarkdownParser()
  const transform = new Transform({
    objectMode: true, transform (path, enc, done) {

      const filePath = resolve(basePath, path)

      stat(filePath, (err, stats) => {
        if (err) {
          console.error(err)
        } else {

          const quadStream = new PassThrough({
            objectMode: true,
            write (object, encoding, callback) {
              this.push(object)
              callback()
            },
          })

          const fileStream = createReadStream(filePath).
            pipe(new ParseMarkdown({ markdownParser }, { path }, {})).
            pipe(new ParseDotTriples()).
            pipe(new ProduceQuads({ uriResolver }, {})).
            pipe(quadStream)

          const dataset = rdf.dataset()
          dataset.import(quadStream)

          fileStream.on('error', done)
          fileStream.on('end', () => {
            const fileUri = uriResolver.getUriFromPath(path)
            const name = uriResolver.getNameFromPath(path)

            // Add stats quads
            dataset.addAll(statsToQuads({ fileUri, path, name, stats }))

            // Apply all dataset-mappers
            let current = dataset
            for (const mapper of datasetMappers) {
              current = mapper(current, {fileUri})
              // @TODO resultDataset = mapper(current,{metadata})
              // Metadata of the exact markdown sources is emmited, and matched with the named-graph
            }

            // Set namedGraph to the current fileUri
            const resultDataset = rdf.dataset().
              addAll([...current].map(
                quad => rdf.quad(quad.subject, quad.predicate, quad.object,
                  fileUri)))

            // Stream output
            if (outputStream) {
              outputStream.write(resultDataset)
            }
            // Callback method
            if (callback) {
              callback(path, resultDataset)
            }
            done()
          })
        }
      });
    },
  })

  if (outputStream) {
    transform.on('error', () => {
      outputStream.destroy()
    }).on('finish', () => {
      outputStream.end()
    }).on('end', () => {
      outputStream.end()
    })
  }
  return transform
}

export { createMarkdownPipeline }
