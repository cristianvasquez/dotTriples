import remarkFrontmatter from 'remark-frontmatter'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import wikiLinkPlugin from 'remark-wiki-link'
import { unified } from 'unified'

function createMarkdownParser () {
  const parser = unified().use(remarkParse).use(remarkFrontmatter).use(remarkGfm).use(wikiLinkPlugin)
  return {
    parse: async (string) => {
      return parser.parse(string)
    }
  }
}

export {createMarkdownParser}
