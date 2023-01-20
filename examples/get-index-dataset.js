import { createTriplifier } from 'vault-triplifier'

import ns from '../src/namespaces.js'
import { triplifyIndex } from '../src/triplifiers/indexTriplifier.js'

const dir = '../test/markdown/'

const options = {
  baseNamespace: ns.ex, namespaces: ns,
}
const triplifier = await createTriplifier(dir)
const pointer = triplifyIndex(triplifier, options)
console.log(pointer.dataset.toString())
