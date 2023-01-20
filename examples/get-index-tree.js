import rdf from 'rdf-ext'
import { createTriplifier } from 'vault-triplifier'

import ns from '../src/namespaces.js'
import { triplifyIndex } from '../src/triplifiers/indexTriplifier.js'

const dir = '../test/markdown/'

const options = {
  baseNamespace: ns.ex, namespaces: ns,
}
const triplifier = await createTriplifier(dir)
const pointer = triplifyIndex(triplifier, options)

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
