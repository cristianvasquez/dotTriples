import rdf from 'rdf-ext'
import { Transform } from 'stream'

class ProduceQuads extends Transform {
  constructor ({ uriResolver }, opts) {
    super({ ...opts, objectMode: true })
    this.uriResolver = uriResolver
  }

  _transform (content, encoding, callback) {

    const { header, subject, predicate, object } = content

    const documentIRI = this.uriResolver.getUriFromPath(header.path)

    const propertyFromRaw = (raw) => {
      return {
        term: this.uriResolver.buildPropertyFromText(raw),
        label: raw,
      }
    }
    const handleUndefined = (x) => {
      return x.uri
        ? { term: x.uri, label: x.name }
        : { term: rdf.literal(x.name) }
    }

    const subjects = subject.entities
      ? subject.entities.map(handleUndefined)
      : [propertyFromRaw(subject.raw)]
    const predicates = predicate.entities
      ? predicate.entities.map(handleUndefined)
      : [propertyFromRaw(predicate.raw)]
    const objects = object.entities
      ? object.entities.map(handleUndefined)
      : [{ term: rdf.literal(object.raw) }]

    for (const subject of subjects) {
      for (const predicate of predicates) {
        for (const object of objects) {
          const quad = rdf.quad(subject.term, predicate.term, object.term,
            documentIRI)
          this.push(quad)
        }
      }
    }

    const labels = (x) => {
      const { term, label } = x
      return rdf.quad(term,
        rdf.namedNode('http://www.w3.org/2001/XMLSchema#label'),
        rdf.literal(label), documentIRI)
    }

    subjects.filter(x=>x.label).map(x => labels(x)).forEach(quad=>this.push(quad))
    predicates.filter(x=>x.label).map(labels).forEach(quad=>this.push(quad))
    objects.filter(x=>x.label).filter(x=>x.term.termType==='NamedNode').map(labels).forEach(quad=>this.push(quad))

    callback()
  }
}

export { ProduceQuads }
