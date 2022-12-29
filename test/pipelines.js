import { expect } from 'expect'
import toMatchSnapshot from 'expect-mocha-snapshot'
import { resolve } from 'path'
import rdf from 'rdf-ext'
import { createTriplifier } from 'rdf-from-markdown'
import { PassThrough } from 'stream'
import ns from '../src/namespaces.js'

import { createMarkdownPipeline } from '../src/pipelines.js'
import { collect } from './support/streams.js'

expect.extend({ toMatchSnapshot })

const basePath = 'test/markdown'

// Config

async function createContext () {

  const triplifier = await createTriplifier(basePath, {
    mappers: {
      'is a': ns.rdf.type, 'are': ns.rdf.type, 'foaf:knows': ns.foaf.knows,
    }, baseNamespace: ns.ex,
  })

  return {
    triplifier, basePath: resolve(basePath),
  }
}

describe('[MarkdownPipeline]', async function () {
  const context = await createContext()
  for (const fileName of context.index.files.filter(x => x.endsWith('.md'))) {

    it(`"${fileName}"`, async function () {

      const outputStream = new PassThrough({
        objectMode: true, write (object, encoding, callback) {
          this.push(object)
          callback()
        },
      })

      // Small version that does not produce dates
      function produceStats ({ fileUri, path, name, stats }) {
        const { size } = stats
        return [
          rdf.quad(fileUri, ns.dot.path, rdf.literal(path), fileUri),
          rdf.quad(fileUri, ns.dot.size, rdf.literal(size, ns.xsd.integer),
            fileUri)]
      }

      const inputStream = createMarkdownPipeline({ ...context, produceStats },
        { outputStream })
      inputStream.write(fileName)
      inputStream.end()

      const [dataset] = await collect(outputStream)

      expect(dataset.toString()).toMatchSnapshot(this)
    })
  }

})
