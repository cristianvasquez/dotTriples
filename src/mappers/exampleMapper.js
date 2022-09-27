import rdf from 'rdf-ext'

const onlyLiteralObjects = (dataset) => {
  const quads = [...dataset].filter(quad => quad.object.termType === 'Literal')
  return rdf.dataset().addAll(quads)
}

export { onlyLiteralObjects }
