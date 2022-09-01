import pkg from 'glob'
import { resolve } from 'path'
import rdf from 'rdf-ext'
import { createContext, MARKDOWN_FILES_PATTERN } from './src/context.js'
import ns from './src/namespaces.js'
import { createMarkdownPipeline } from './src/pipelines.js'
import { createDatasetPrinterOutput } from './src/streams.js'

const { Glob } = pkg

const dir = './test/markdown/'
// const dir = '../../../obsidian/workspace/'

// Config
const vault = rdf.namespace('http://example.org/')
const mappers = {
  'is a': ns.rdf.type,
}

// Build pipelines
const outputStream = createDatasetPrinterOutput({ onlyCounts: false })
const context = await createContext({ basePath: resolve(dir), baseNamespace:vault, mappers })
const inputStream = createMarkdownPipeline(context, outputStream)

// Add files one by one
// inputStream.write('hello.md')
// inputStream.write('Yaml.md')
// inputStream.write('./a/Test.md')

// Search for all markdown in the directory
const search = new Glob(MARKDOWN_FILES_PATTERN,
  { nodir: true, cwd: context.basePath })
search.on('match', filename => inputStream.write(filename))
// search.on('end', files => console.log(`[All Files] ${files}`))
search.on('error', error => console.log(`[Error] ${error}`))
search.on('abort', abort => console.log(`[Abort] ${abort}`))
