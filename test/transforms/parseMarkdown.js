import { expect } from 'expect'

import toMatchSnapshot from 'expect-mocha-snapshot'
import { createReadStream } from 'fs'
import { resolve } from 'path'
import { createMarkdownParser } from '../../src/markdownParser.js'
import { ParseMarkdown } from '../../src/transforms/parseMarkdown.js'

expect.extend({ toMatchSnapshot })

async function collect (readable) {
  const data = []
  for await (const chunk of readable) {
    data.push(chunk)
  }
  return data
}

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
