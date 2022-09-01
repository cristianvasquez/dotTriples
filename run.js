import { resolve } from 'path'
import { createContext, DEFAULT_SEARCH_PATTERN } from './src/context.js'
import { createMarkdownPipeline } from './src/pipelines.js'
import {
  createDatasetPrinterOutput,
} from './src/streams.js'
import pkg from 'glob'
const { Glob } = pkg

const outputStream = createDatasetPrinterOutput()
const context = await createContext(resolve('./test/markdown/'))
const inputStream = createMarkdownPipeline(context, outputStream)

// inputStream.write('hello.md')
// inputStream.write('Yaml.md')
// inputStream.write('./a/Test.md')

const search = new Glob(DEFAULT_SEARCH_PATTERN,
  { nodir: true, cwd: context.basePath })
search.on('match', filename => inputStream.write(filename))
search.on('end', files => console.log(`[All Files] ${files}`))
search.on('error', error => console.log(`[Error] ${error}`))
search.on('abort', abort => console.log(`[Abort] ${abort}`))
