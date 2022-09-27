import { Presets, SingleBar } from 'cli-progress'
import { resolve } from 'path'
import { createContext } from './src/context.js'
import { createDefaultMappers } from './src/mappers/index.js'
import ns from './src/namespaces.js'
import { createMarkdownPipeline } from './src/pipelines.js'
import { createPrettyPrinter } from './src/streams.js'

const dir = './test/markdown/'
// const dir = '../../../obsidian/workspace/'

// Config
const vault = ns.ex
const mappers = {
  'is a': ns.rdf.type,
  'are': ns.rdf.type,
  'foaf:knows': ns.foaf.knows,
}

// Build pipelines
const outputStream = await createPrettyPrinter({ prefixes: { ex: vault } })
const context = await createContext(
  { basePath: resolve(dir), baseNamespace: vault, mappers })
const datasetMappers = createDefaultMappers(context)

const progressBar = new SingleBar({}, Presets.shades_classic)
const files = context.index.files.filter(x => x.endsWith('.md'))
progressBar.start(files.length, 0)
const callback = (path, dataset) => {
  progressBar.increment()
}
const inputStream = createMarkdownPipeline({ ...context, datasetMappers },
  { outputStream, callback })

// Add files one by one
for (const file of files) {
  inputStream.write(file)
}

inputStream.end()
