import { createReadStream, stat } from 'fs'
import { resolve } from 'path'
import rdf from 'rdf-ext'
import { PassThrough, Transform } from 'stream'
import { FromMarkdown } from './transforms/fromMarkdown.js'
import { statsToQuads } from './triplifiers/statsToQuads.js'

function setGraph (dataset, namedGraph) {
  return rdf.dataset().
    addAll([...dataset].map(
      quad => rdf.quad(quad.subject, quad.predicate, quad.object, namedGraph)))
}

// Expects markdown files, and produces datasets
function createMarkdownPipeline ({
  basePath, triplifier, produceStats = statsToQuads,
}, { outputStream, callback }) {

  if (!(outputStream || callback)) {
    throw Error('outputStream stream and/or callback is required')
  }

  const transform = new Transform({
    objectMode: true, transform (path, enc, done) {

      const filePath = resolve(basePath, path)

      stat(filePath, (err, stats) => {
        if (err) {
          console.error(err)
        } else {
          const quadStream = new PassThrough({
            objectMode: true, write (object, encoding, callback) {
              this.push(object)
              callback()
            },
          })

          const fileStream = createReadStream(filePath).
            pipe(new FromMarkdown({ triplifier, path }, {})).
            pipe(quadStream)

          const dataset = rdf.dataset()
          dataset.import(quadStream)

          fileStream.on('error', done)
          fileStream.on('end', () => {
            const fileUri = triplifier.termMapper.fromPath(path)

            // Add stats quads
            dataset.addAll(produceStats({ fileUri, path: filePath, stats }))

            // Set namedGraph to the current fileUri
            const resultDataset = setGraph(dataset, fileUri)

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
      })
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
