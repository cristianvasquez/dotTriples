import { resolve } from 'path'
import rdf from 'rdf-ext'
import { createContext } from '../src/context.js'
import { createIndexDataset } from '../src/createIndex.js'
import ns from '../src/namespaces.js'

const dir = '../test/markdown/'
const context = await createContext(
  { basePath: resolve(dir), baseNamespace: ns.ex, mappers: {} })

const dataset = createIndexDataset(context)
const pointer = rdf.clownface({ term: ns.dot.root, dataset })

function treeRoot (pointer) {
  const visited = rdf.termSet()
  function tree (ptr) {
    const children = ptr.out(ns.dot.contains).terms.filter(x => {
      const isNew = !visited.has(x)
      visited.add(x)
      return isNew
    }).map(outGoing => tree(
      ptr.node(outGoing)))
    return {
      key: ptr.term.value,
      label: ptr.out(ns.schema.name).term?.value,
      ...(children.length && { children  }),
      isLeaf:ns.dot.Folder.value !== ptr.out(ns.rdf.type).term?.value
    }
  }
  return tree(pointer)
}

console.log(treeRoot(pointer))
