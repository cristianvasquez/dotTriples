import { expect } from 'expect'

import toMatchSnapshot from 'expect-mocha-snapshot'
import { createReadStream } from 'fs'
import { resolve } from 'path'
import { createMarkdownParser } from '../../src/markdown/markdownParser.js'
import { ParseMarkdown } from '../../src/transforms/parseMarkdown.js'
import {collect} from '../support/streams.js'

expect.extend({ toMatchSnapshot })

const files = ['links.md']
const basePath = 'test/transforms/support'
const markdownParser = createMarkdownParser()

describe('[pipelines.js]', async function () {

  files.forEach((current) => {
    it(`"${current}"`, async function () {
      const filePath = resolve(basePath, current)
      const stream = createReadStream(filePath).
        pipe(new ParseMarkdown({ markdownParser }, {}, {}))
      const data = await collect(stream)
      expect(data).toMatchSnapshot(this)
    })
  })

})
