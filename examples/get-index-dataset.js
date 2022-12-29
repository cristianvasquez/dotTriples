import { createTriplifier } from 'rdf-from-markdown'

import ns from '../src/namespaces.js'
import { triplifyIndex } from '../src/triplifiers/indexTriplifier.js'

const dir = '../test/markdown/'

const triplifier = await createTriplifier(dir, {
  mappers: {}, baseNamespace: ns.ex,
})

const pointer = triplifyIndex(triplifier)

console.log(pointer.dataset.toString())

