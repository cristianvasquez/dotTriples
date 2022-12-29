import rdf from 'rdf-ext'
import { createTriplifier } from 'rdf-from-markdown'

import ns from '../src/namespaces.js'
import { triplifyIndex } from '../src/triplifiers/indexTriplifier.js'

const dir = '../test/markdown/'

const triplifier = await createTriplifier(dir, {
  mappers: {}, baseNamespace: ns.ex,
})

const pointer = triplifyIndex(triplifier)

function treeRoot (pointer) {
  const visited = rdf.termSet()

  function tree (ptr) {
    const children = ptr.out(ns.dot.contains).terms.filter(x => {
      const isNew = !visited.has(x)
      visited.add(x)
      return isNew
    }).map(outGoing => tree(ptr.node(outGoing)))
    return {
      key: ptr.term.value,
      label: ptr.out(ns.schema.name).term?.value, ...(children.length &&
        { children }),
      isLeaf: ns.dot.Folder.value !== ptr.out(ns.rdf.type).term?.value,
    }
  }

  return tree(pointer)
}

console.log(treeRoot(pointer))
