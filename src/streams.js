import { turtle } from '@rdfjs-elements/formats-pretty/serializers'
import getStream from 'get-stream'
import { Readable } from 'readable-stream'
import { PassThrough, Transform } from 'stream'
import ns from './namespaces.js'
import rdf from 'rdf-ext'

function printJsons () {
  return createOutputStream({
    forEach: (chunk => {
      console.log(JSON.stringify(chunk, null, 2))
    }),
  })
}

function printQuads () {
  return createOutputStream({
    forEach: (chunk => {
      console.log(chunk.toString())
    }),
  })
}

function printCounts () {
  return new Transform({
    objectMode: true,
    write (chunk, encoding, callback) {
      this.count = (this.count ?? 0) + 1
      callback()
    },
    flush (callback) {
      console.log(`${this.count} quads`)
      callback()
    },
  })
}

async function prettyPrint ({ prefixes } = {}) {

  function toPlain () {
    const result = {}
    for (const [key, value] of Object.entries({ ...ns, ...prefixes })) {
      result[key] = value().value
    }
    return result
  }

  const sink = await turtle({
    prefixes: toPlain(),
  })

  return new Transform({
    objectMode: true,
    write (quad, encoding, callback) {
      if (!this.quads) {
        this.quads = []
      }
      this.quads.push(quad)
      callback()
    },
    async flush (callback) {
      const dataset = rdf.dataset().addAll(this.quads) // Trick to remove duplicates
      const stream = await sink.import(dataset.toStream())
      const result = await getStream(stream)
      console.log(result)
      callback()
    },
  })
}

function createOutputStream ({ forEach } = { forEach: x => x }) {
  return new PassThrough({
    objectMode: true,
    write (object, encoding, callback) {
      forEach(object)
      this.push(object)
      callback()
    },
  })
}

export {
  printJsons,
  printQuads,
  printCounts,
  createOutputStream,
  prettyPrint
}
