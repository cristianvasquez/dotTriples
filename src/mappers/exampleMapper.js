import rdf from 'rdf-ext'

const onlyLiteralObjects = (dataset, { fileUri }) => {
  const quads = [...dataset].filter(quad => quad.object.termType === 'Literal')
  return rdf.dataset().addAll(quads)
}

export { onlyLiteralObjects }
