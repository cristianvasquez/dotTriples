import rdf from 'rdf-ext'
import ns from '../namespaces.js'

function toTree (pointer) {
  const visited = rdf.termSet()
  let current = 1

  function tree (ptr) {
    const children = ptr.out(ns.dot.contains).terms.filter(x => {
      const isNew = !visited.has(x)
      visited.add(x)
      return isNew
    }).map(outGoing => tree(
      ptr.node(outGoing)))
    current = current + 1
    return {
      key: ptr.term.value,
      label: ptr.out(ns.schema.name).term?.value,
      ...(children.length && { children }),
      isLeaf: ns.dot.Folder.value !== ptr.out(ns.rdf.type).term?.value,
    }
  }

  return [tree(pointer)]
}

export { toTree }
