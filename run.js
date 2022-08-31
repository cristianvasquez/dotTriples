import { resolve } from 'path'
import { createContext } from './src/context.js'
import { createMarkdownPipeline } from './src/pipelines.js'
import { createJsonPrinterOutput } from './src/streams.js'

const destStream = createJsonPrinterOutput()

const context = await createContext(resolve('./test/markdown/'))
const transform = createMarkdownPipeline(context, destStream)

transform.write('hello.md')
transform.write('Yaml.md')
transform.write('./a/Test.md')

// const search = new Glob(DEFAULT_SEARCH_PATTERN,
//   { nodir: true, cwd: context.basePath })
// search.on('match', filename => inputStream.write(filename))
// search.on('end', files => console.log(`[All Files] ${files}`))
// search.on('error', error => console.log(`[Error] ${error}`))
// search.on('abort', abort => console.log(`[Abort] ${abort}`))
