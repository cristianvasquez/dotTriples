import { onlyLiteralObjects } from './exampleMapper.js'
import { createFolderMapper } from './fileSystemMappers.js'

const exampleMappers = [
  onlyLiteralObjects,
]

function createDefaultMappers (context) {
  return [
    createFolderMapper(context),
  ]
}

export { exampleMappers, createDefaultMappers }
