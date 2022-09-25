import { resolve } from 'path'
import { createContext } from './src/context.js'
import ns from './src/namespaces.js'
import { createMarkdownPipeline } from './src/pipelines.js'
import { createPrettyPrinter } from './src/streams.js'

const dir = './test/markdown/'

// Config
const vault = ns.ex
const mappers = {
  'is a': ns.rdf.type,
  'are': ns.rdf.type,
  'foaf:knows': ns.foaf.knows,
}

const quadProducers = []

// Build pipelines
const outputStream = await createPrettyPrinter({ prefixes: { ex: vault } })
const context = await createContext(
  { basePath: resolve(dir), baseNamespace: vault, mappers, quadProducers })
const inputStream = createMarkdownPipeline(context, outputStream)

// Add files one by one
for (const file of context.index.files.filter(x => x.endsWith('.md'))) {
  inputStream.write(file)
}
inputStream.end()
