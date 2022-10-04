import { onlyLiteralObjects } from './exampleMapper.js'

const exampleMappers = [
  onlyLiteralObjects,
]

function createDefaultMappers (context) {
  return [
    // createFolderMapper(context),
  ]
}

export { exampleMappers, createDefaultMappers }
