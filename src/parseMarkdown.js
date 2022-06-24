import { YozoraParser } from '@yozora/parser'

const parser = new YozoraParser()
const ast = parser.parse('source content')

console.log(JSON.stringify(ast,null,2))