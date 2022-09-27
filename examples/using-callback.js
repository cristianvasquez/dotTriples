import { resolve } from 'path'
import { createContext } from '../src/context.js'
import ns from '../src/namespaces.js'
import { createMarkdownPipeline } from '../src/pipelines.js'

const dir = '../test/markdown/'
const context = await createContext(
  { basePath: resolve(dir), baseNamespace: ns.ex, mappers: {} })

const printResult = (path, dataset) => {
  console.log(path)
  console.log(dataset.toString())
}

const inputStream = createMarkdownPipeline(context, { callback: printResult })

for (const file of context.index.files.filter(x => x.endsWith('.md'))) {
  inputStream.write(file)
}
inputStream.end()

