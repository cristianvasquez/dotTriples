import remarkFrontmatter from 'remark-frontmatter'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

function createMarkdownParser () {
  const parser = unified().use(remarkParse).use(remarkFrontmatter)
  return {
    parse: async (string) => {
      return parser.parse(string)
    }
  }
}

export {createMarkdownParser}
