import { Presets, SingleBar } from 'cli-progress'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { createTriplifier } from 'vault-triplifier'

import ns from './src/namespaces.js'
import { createOutputStream } from './src/streams.js'

// const dir = './test/markdown/'
const dir = '../../../obsidian/workspace/'

const options = {
  addLabels: true,
  includeWikipaths: true,
  splitOnHeader: true,
  baseNamespace: ns.ex,
  namespaces: ns,
}

// const outputStream = await createDatasetPrinter()
// const outputStream = await createPrettyPrinter({ prefixes: ns })
// const outputStream = await createCounter()
const outputStream = await createOutputStream()

// Build pipelines
const triplifier = await createTriplifier(dir)
const files = [...triplifier.getCanvasFiles(), ...triplifier.getMarkdownFiles()]
const progressBar = new SingleBar({}, Presets.shades_classic)
progressBar.start(files.length, 0)
console.time('\ntriplify total')

for (const file of files) {
  const text = await readFile(resolve(dir, file), 'utf8')
  const pointer = triplifier.toRDF(text, { path: file }, options)
  progressBar.increment()
  if (progressBar.getProgress() === 1) {
    console.timeEnd('\ntriplify total')
  }
}


