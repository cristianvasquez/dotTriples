import { resolve } from 'path'
import rdf from 'rdf-ext'
import { PassThrough } from 'stream'
import { createContext } from '../src/context.js'
import ns from '../src/namespaces.js'
import { createMarkdownPipeline } from '../src/pipelines.js'

const dir = '../test/markdown/'
const context = await createContext(
  { basePath: resolve(dir), baseNamespace: ns.ex, mappers: {} })

const outputStream = new PassThrough({
  objectMode: true,
  write (object, encoding, callback) {
    this.push(object)
    callback()
  },
})
const inputStream = createMarkdownPipeline(context, outputStream)

for (const file of context.index.files.filter(x => x.endsWith('.md'))) {
  inputStream.write(file)
}
inputStream.end()
const dataset = await rdf.dataset().import(outputStream)
console.log(dataset.toString())
