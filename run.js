import { Presets, SingleBar } from 'cli-progress'
import { resolve } from 'path'
import ns from './src/namespaces.js'
import { createMarkdownPipeline } from './src/pipelines.js'
import { createPrettyPrinter } from './src/streams.js'
import { createTriplifier } from 'rdf-from-markdown'

const dir = './test/markdown/'
// const dir = '../../../obsidian/workspace/'

const basePath = resolve(dir)

const triplifier = await createTriplifier(dir, {
  mappers: {
    'is a': ns.rdf.type, 'are': ns.rdf.type, 'foaf:knows': ns.foaf.knows,
  }, baseNamespace: ns.ex,
})

// Build pipelines
const outputStream = await createPrettyPrinter({ prefixes: { ex: ns.ex } })

const progressBar = new SingleBar({}, Presets.shades_classic)
const files = triplifier.index.files.filter(x => x.endsWith('.md'))
progressBar.start(files.length, 0)
const callback = (path, dataset) => {
  progressBar.increment()
}
const inputStream = createMarkdownPipeline({ basePath, triplifier },
  { outputStream, callback })

// Add files one by one
for (const file of files) {
  inputStream.write(file)
}

inputStream.end()
