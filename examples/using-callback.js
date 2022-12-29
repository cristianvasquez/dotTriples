import { resolve } from 'path'
import { createTriplifier } from 'rdf-from-markdown'
import ns from '../src/namespaces.js'
import { createMarkdownPipeline } from '../src/pipelines.js'

const dir = '../test/markdown/'

const triplifier = await createTriplifier(dir, {
  mappers: {}, baseNamespace: ns.ex,
})

const printResult = (path, dataset) => {
  console.log(path)
  console.log(dataset.toString())
}

const inputStream = createMarkdownPipeline({
  basePath: resolve(dir), triplifier,
}, { callback: printResult })

for (const file of triplifier.index.files.filter(x => x.endsWith('.md'))) {
  inputStream.write(file)
}
inputStream.end()

