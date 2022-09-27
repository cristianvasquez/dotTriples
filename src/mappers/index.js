import { onlyLiteralObjects } from './exampleMapper.js'

const exampleMappers = [
  onlyLiteralObjects,
]

function createDefaultMappers (context) {
  return [
    // onlyLiteralObjects,
  ]
}

export { exampleMappers, createDefaultMappers }
