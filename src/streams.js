import { trig } from '@rdfjs-elements/formats-pretty/serializers'
import getStream from 'get-stream'
import rdf from 'rdf-ext'
import { PassThrough, Transform } from 'stream'
import ns from './namespaces.js'

function createJsonPrinter () {
  return createOutputStream({
    forEach: (chunk => {
      console.log(JSON.stringify(chunk, null, 2))
    }),
  })
}

function createDatasetPrinter () {
  return createOutputStream({
    forEach: (chunk => {
      console.log(chunk.toString())
    }),
  })
}

function createCounter () {
  return new Transform({
    objectMode: true,
    write (chunk, encoding, callback) {
      this.count = (this.count ?? 0) + 1
      callback()
    },
    flush (callback) {
      console.log(`${this.count} elements`)
      callback()
    },
  })
}

async function createPrettyPrinter ({ prefixes = {} }) {

  function toPlain () {
    const result = {}
    for (const [key, value] of Object.entries({ ...ns, ...prefixes })) {
      result[key] = value().value
    }
    return result
  }

  const sink = await trig({
    prefixes: toPlain(),
  })

  return new Transform({
    objectMode: true,
    write (dataset, encoding, callback) {
      if (!this.dataset) {
        this.dataset = rdf.dataset()
      }
      this.dataset.addAll([...dataset])
      callback()
    },
    async flush (callback) {
      const stream = await sink.import(this.dataset.toStream())
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
  createJsonPrinter,
  createDatasetPrinter,
  createCounter,
  createPrettyPrinter,
}
