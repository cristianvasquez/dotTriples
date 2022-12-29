import { resolve } from 'path'
import rdf from 'rdf-ext'
import { createTriplifier } from 'rdf-from-markdown'
import { PassThrough } from 'stream'
import ns from '../src/namespaces.js'
import { createMarkdownPipeline } from '../src/pipelines.js'

async function collect (readable) {
  const result = rdf.dataset()
  for await (const dataset of readable) {
    result.addAll([...dataset])
  }
  return result
}

const dir = '../test/markdown/'
// const dir = '../../../../obsidian/workspace/'

const triplifier = await createTriplifier(dir, {
  mappers: {}, baseNamespace: ns.ex,
})

const outputStream = new PassThrough({
  objectMode: true, write (object, encoding, callback) {
    this.push(object)
    callback()
  },
})

const inputStream = createMarkdownPipeline(
  { basePath: resolve(dir), triplifier }, { outputStream })

for (const file of triplifier.index.files.filter(x => x.endsWith('.md'))) {
  inputStream.write(file)
}
inputStream.end()
const result = await collect(outputStream)
console.log(result.toString())

