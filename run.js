import pkg from 'glob'
import { resolve } from 'path'
import { createContext, MARKDOWN_FILES } from './src/context.js'
import { createMarkdownPipeline } from './src/pipelines.js'
import { createDatasetPrinterOutput } from './src/streams.js'

const { Glob } = pkg

const dir = './test/markdown/'
// const dir = '../../../obsidian/workspace/'

const outputStream = createDatasetPrinterOutput()
const context = await createContext(resolve(dir))
const inputStream = createMarkdownPipeline(context, outputStream)

// inputStream.write('hello.md')
// inputStream.write('Yaml.md')
// inputStream.write('./a/Test.md')

const search = new Glob(MARKDOWN_FILES,
  { nodir: true, cwd: context.basePath })
search.on('match', filename => inputStream.write(filename))
// search.on('end', files => console.log(`[All Files] ${files}`))
search.on('error', error => console.log(`[Error] ${error}`))
search.on('abort', abort => console.log(`[Abort] ${abort}`))
