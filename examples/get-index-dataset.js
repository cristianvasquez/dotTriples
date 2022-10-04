import { resolve } from 'path'
import { createContext } from '../src/context.js'
import { createIndexDataset } from '../src/createIndex.js'
import ns from '../src/namespaces.js'

const dir = '../test/markdown/'
const context = await createContext(
  { basePath: resolve(dir), baseNamespace: ns.ex, mappers: {} })

const result = createIndexDataset(context)

console.log(result.toString())

