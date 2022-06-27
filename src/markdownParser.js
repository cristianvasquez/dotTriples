import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'

function createMarkdownParser () {
  const parser = unified().use(remarkParse).use(remarkFrontmatter).use(remarkGfm).use(remarkRehype)
  return {
    parse: async (string) => {
      return parser.parse(string)
    }
  }
}

export {createMarkdownParser}
//
// const parser = createParser()
// const result = await parser.parse(`---
// tags:
//   - 'journal/2022/06'
// ---
//
// # Title
//
// Some text
//
// a :: b
// `)
//
// console.log(JSON.stringify(result, null, 2))
