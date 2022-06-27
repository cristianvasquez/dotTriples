import { Transform } from 'stream'
import { COMMENTED_DOTDOT, DOTDOT, THIS, UNDEFINED } from '../consts.js'
import { LINKS_REGEXP } from '../regexp.js'

class Markdown extends Transform {
  constructor (markdownParser, opts) {
    super({ ...opts, objectMode: true })
    this.markdownParser = markdownParser
  }

  async _transform (chunk, encoding, callback) {

    const fullText = chunk.toString()
    const markdown = await this.markdownParser.parse(fullText)
    for (const current of markdown.children) {
      if (current.type === 'yaml') {
        // PARSE and handle YAML
      } else if (current.type === 'paragraph' || current.type === `heading`) {
        this.push(fullText.substring(current.position.start.offset, current.position.end.offset))
      }
    }

    callback()
  }
}

export { Markdown }
