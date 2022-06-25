import { resolve } from 'path'
import { PassThrough } from 'stream'
import pkg from 'glob'
import { buildIndex, DEFAULT_SEARCH_PATTERN } from './src/buildIndex.js'

const { Glob } = pkg
import { createDotTriplesInputStream } from './src/dotTriplesInputStream.js'
import { createUriResolver } from './src/uriResolver.js'

// const basePath = resolve('/home/cvasquez/obsidian/workspace')
const basePath = resolve('./test/markdown')
const index = await buildIndex(basePath)
const uriResolver = createUriResolver(index)

const context = {
  basePath,
  uriResolver
}

const destStream = new PassThrough({
  objectMode: true,
  write (chunk, encoding, callback) {
    console.log(JSON.stringify(chunk, null, 2))
    this.push(chunk)
    callback()
  }
})
const inputStream = createDotTriplesInputStream(context, destStream)

const search = new Glob(DEFAULT_SEARCH_PATTERN, { nodir: true, cwd: context.basePath })
search.on('match', filename => inputStream.write(filename))
search.on('end', files => console.log(`[All Files] ${files}`))
search.on('error', error => console.log(`[Error] ${error}`))
search.on('abort', abort => console.log(`[Abort] ${abort}`))
