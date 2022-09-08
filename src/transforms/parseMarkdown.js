import { Transform } from 'stream'

const ofInterest = (root) => (root.type === 'link' || root.type ===
  'wikiLink' || root.type === 'image')

class ParseMarkdown extends Transform {
  constructor ({ markdownParser }, header, opts) {
    super({ ...opts, objectMode: true })
    this.markdownParser = markdownParser
    this.header = header
  }

  collectChilds (parent, data = []) {
    if (parent.children) {
      return parent.children.reduce(
        (accumulator, currentValue) => {
          if (ofInterest(currentValue)) {
            return [currentValue, ...accumulator]
          } else {
            return this.collectChilds(currentValue, accumulator)
          }
        }, data)
    } else {
      return ofInterest(parent) ? [parent, ...data] : data
    }
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

      const links = this.collectChilds(child).map(node => {

        // sometimes the parser doesn't report a position. Weird.
        // @TODO report bug. example:'mailto:asset+block@lectureslides_chap3NOphantom.pdf'
        const linkText = node.position ? fullText.substring(
          node.position.start.offset,
          node.position.end.offset) : node.url
        const result = {
          ...node,
          text: linkText,
        }
        delete result.children
        delete result.position
        return result
      })

      this.push({
        header,
        type,
        text,
        value,
        links,
      })
    }
    callback()
  }
}

export { ParseMarkdown }
