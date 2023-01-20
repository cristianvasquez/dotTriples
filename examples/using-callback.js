import { resolve } from 'path'
import { createTriplifier } from 'vault-triplifier'
import ns from '../src/namespaces.js'
import { createMarkdownPipeline } from '../src/pipelines.js'

const dir = '../test/markdown/'

const options = {
  addLabels: true,
  includeWikipaths: true,
  splitOnHeader: true,
  baseNamespace: ns.ex,
  namespaces: ns,
}

const triplifier = await createTriplifier(dir)

const printResult = (path, dataset) => {
  console.log(path)
  console.log(dataset.toString())
}

const inputStream = createMarkdownPipeline({
  basePath: resolve(dir), triplifier, options,
}, { callback: printResult })

for (const file of triplifier.getMarkdownFiles()) {
  inputStream.write(file)
}
inputStream.end()

