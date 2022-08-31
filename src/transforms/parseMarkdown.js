import { Transform } from 'stream'

class ParseMarkdown extends Transform {
  constructor ({ markdownParser }, header, opts) {
    super({ ...opts, objectMode: true })
    this.markdownParser = markdownParser
    this.header = header
  }

  async _transform (chunk, encoding, callback) {
    const fullText = chunk.toString()
    const markdown = await this.markdownParser.parse(fullText)
    for (const child of markdown.children) {
      const {
        type,
        value,
        position: {
          start: { offset: startOffset },
          end: { offset: endOffset },
        },
      } = child
      const text = fullText.substring(startOffset, endOffset)

      const header = { ...this.header, startOffset, endOffset }
      this.push({
        header,
        type,
        text,
        value,
      })
    }
    callback()
  }
}

export { ParseMarkdown }
