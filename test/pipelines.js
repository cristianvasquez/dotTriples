import { expect } from 'expect'

import toMatchSnapshot from 'expect-mocha-snapshot'
import { resolve } from 'path'
import rdf from 'rdf-ext'
import { PassThrough } from 'stream'
import { createContext } from '../src/context.js'
import ns from '../src/namespaces.js'

import { createMarkdownPipeline } from '../src/pipelines.js'
import { collect } from './support/streams.js'

expect.extend({ toMatchSnapshot })

const basePath = 'test/markdown'

// Config
const baseNamespace = ns.ex
const mappers = {
  'is a': ns.rdf.type,
  'are': ns.rdf.type,
  'foaf:knows': ns.foaf.knows,
}
const quadProducers = []

// Build pipelines
const context = await createContext(
  { basePath: resolve(basePath), baseNamespace, mappers, quadProducers })

describe('[MarkdownPipeline]', async function () {

  for (const fileName of context.index.files.filter(x => x.endsWith('.md'))) {

    it(`"${fileName}"`, async function () {

      const outputStream = new PassThrough({
        objectMode: true,
        write (object, encoding, callback) {
          this.push(object)
          callback()
        },
      })

      // Small version that does not produce dates
      function statsToQuads ({ fileUri, path, name, stats }) {
        const { size } = stats
        return [
          rdf.quad(fileUri, ns.dot.path, rdf.literal(path)),
          rdf.quad(fileUri, ns.dot.name, rdf.literal(name)),
          rdf.quad(fileUri, ns.dot.size, rdf.literal(size, ns.xsd.integer)),
        ]
      }

      const inputStream = createMarkdownPipeline({ ...context, statsToQuads },
        { outputStream })
      inputStream.write(fileName)
      inputStream.end()

      const [dataset] = await collect(outputStream)

      expect(dataset.toString()).toMatchSnapshot(this)
    })
  }

})
