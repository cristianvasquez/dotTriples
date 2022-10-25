import { Transform } from 'stream'
import { findLinks } from '../markdown/astVisitor.js'

class ParseMarkdown extends Transform {
  constructor ({ markdownParser }, header, opts) {
    super({ ...opts, objectMode: true })
    this.markdownParser = markdownParser
    this.header = header
    this.counter = 0
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

      const links = findLinks({ astNode: child, fullText })

      this.counter = this.counter + 1
      this.push({
        header: { ...header, counter: this.counter }, // Traceability of the source
        type, // AST node type
        text, // Text in the source
        value, // results of the parsing
        links, // found links
      })
    }
    callback()
  }
}

export { ParseMarkdown }
