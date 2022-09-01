import rdf from 'rdf-ext'

const ns = {
  rdf: rdf.namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  schema: rdf.namespace('http://schema.org/'),
  sh: rdf.namespace('http://www.w3.org/ns/shacl#'),
  xsd: rdf.namespace('http://www.w3.org/2001/XMLSchema#'),
}

export default ns
