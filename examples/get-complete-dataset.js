import { resolve } from 'path'
import rdf from 'rdf-ext'
import { PassThrough } from 'stream'
import { createContext, createMarkdownPipeline, ns } from '../index.js'

async function collect (readable) {
  const result = rdf.dataset()
  for await (const dataset of readable) {
    result.addAll([...dataset])
  }
  return result
}

const dir = '../test/markdown/'
const context = await createContext(
  { basePath: resolve(dir), baseNamespace: ns.ex, mappers: {} })

const outputStream = new PassThrough({
  objectMode: true, write (object, encoding, callback) {
    this.push(object)
    callback()
  },
})

const inputStream = createMarkdownPipeline(context, { outputStream })

for (const file of context.index.files.filter(x => x.endsWith('.md'))) {
  inputStream.write(file)
}
inputStream.end()
const result = await collect(outputStream)
console.log(result.toString())

