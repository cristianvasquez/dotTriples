import { Presets, SingleBar } from 'cli-progress'
import { resolve } from 'path'
import { createTriplifier } from 'vault-triplifier'
import {
  customMapper,
} from 'vault-triplifier/src/termMapper/defaultCustomMapper.js'
import ns from './src/namespaces.js'
import { createMarkdownPipeline } from './src/pipelines.js'
import { createPrettyPrinter } from './src/streams.js'

const dir = './test/markdown/'
// const dir = '../../../obsidian/workspace/'

const basePath = resolve(dir)

const triplifier = await createTriplifier(dir, {
  baseNamespace: ns.ex, customMapper,
})

// Build pipelines
const outputStream = await createPrettyPrinter({ prefixes: { ex: ns.ex } })
const progressBar = new SingleBar({}, Presets.shades_classic)

const files = triplifier.vault.getFiles().filter(x => x.endsWith('.md'))
progressBar.start(files.length, 0)
const callback = (path, dataset) => {
  progressBar.increment()
}

const options = { addLabels: true, includeWikipaths: true, splitOnHeader: true }

const inputStream = createMarkdownPipeline({ basePath, triplifier, options },
  { outputStream, callback })

// Add files one by one
for (const file of files) {
  inputStream.write(file)
}

inputStream.end()
