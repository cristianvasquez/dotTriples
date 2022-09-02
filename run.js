import pkg from 'glob'
import { resolve } from 'path'
import rdf from 'rdf-ext'
import { createContext } from './src/context.js'
import ns from './src/namespaces.js'
import { createMarkdownPipeline } from './src/pipelines.js'
import { printDatasets } from './src/streams.js'

const { Glob } = pkg

const dir = './test/markdown/'
// const dir = '../../../obsidian/workspace/'

// Config
const vault = rdf.namespace('http://example.org/')
const customMappers = {
  'is a': ns.rdf.type,
  'are': ns.rdf.type,
  'foaf:knows': ns.foaf.knows,
}

// Build pipelines
const outputStream = printDatasets()
const context = await createContext(
  { basePath: resolve(dir), baseNamespace: vault, mappers: customMappers })
const inputStream = createMarkdownPipeline(context, outputStream)

// Add files one by one
// inputStream.write('hello.md')

for (const file of context.index.files.filter(x => x.endsWith('.md'))) {
  inputStream.write(file)
}

// Search for all markdown in the directory
// const search = new Glob(MARKDOWN_FILES_PATTERN,
//   { nodir: true, cwd: context.basePath })
// search.on('match', filename => inputStream.write(filename))
// // search.on('end', files => console.log(`[All Files] ${files}`))
// search.on('error', error => console.log(`[Error] ${error}`))
// search.on('abort', abort => console.log(`[Abort] ${abort}`))
