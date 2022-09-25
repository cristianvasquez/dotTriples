import rdf from 'rdf-ext'
import { Transform } from 'stream'
import ns from '../namespaces.js'

class ProduceQuads extends Transform {
  constructor ({ uriResolver, quadProducers }, opts) {
    super({ ...opts, objectMode: true })
    this.uriResolver = uriResolver
  }

  _transform (content, encoding, callback) {

    const { header, subject, predicate, object } = content

    const documentIRI = this.uriResolver.getUriFromPath(header.path)

    const propertyFromRaw = (raw) => {
      return {
        term: this.uriResolver.buildPropertyFromText(raw),
        raw,
      }
    }
    const uriOrLiteral = (x) => {
      return x.uri
        ? { term: x.uri, raw: x.name }
        : { term: rdf.literal(x.name), raw: x.name }
    }

    const subjects = subject.entities
      ? subject.entities.map(uriOrLiteral)
      : [propertyFromRaw(subject.raw)]
    const predicates = predicate.entities
      ? predicate.entities.map(uriOrLiteral)
      : [propertyFromRaw(predicate.raw)]
    const objects = object.entities
      ? object.entities.map(uriOrLiteral)
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
      const { term, raw } = x
      return rdf.quad(term,
        ns.rdfs.label,
        rdf.literal(raw), documentIRI)
    }

    subjects.filter(x => x.raw).
      map(x => labels(x)).
      forEach(quad => this.push(quad))
    predicates.filter(x => x.raw).map(labels).forEach(quad => this.push(quad))
    objects.filter(x => x.raw).
      filter(x => x.term.termType === 'NamedNode').
      map(labels).
      forEach(quad => this.push(quad))

    callback()
  }
}

export { ProduceQuads }
