import { Presets, SingleBar } from 'cli-progress'
import { resolve } from 'path'
import { createContext } from './src/context.js'
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

const quadProducers = []

// Build pipelines
const outputStream = await createPrettyPrinter({ prefixes: { ex: vault } })
const context = await createContext(
  { basePath: resolve(dir), baseNamespace: vault, mappers, quadProducers })

const progressBar = new SingleBar({}, Presets.shades_classic)
const files = context.index.files.filter(x => x.endsWith('.md'))
let current = 0
progressBar.start(files.length, current)
const callback = (path) => {
  current = current + 1
  progressBar.update(current)
}
const inputStream = createMarkdownPipeline({ ...context, callback }, outputStream)

// Add files one by one
for (const file of files) {
  inputStream.write(file)
}

inputStream.end()
