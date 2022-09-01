import rdf from 'rdf-ext'
import { Transform } from 'stream'

class ProduceDatasets extends Transform {
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

    const dataset = rdf.dataset()

    for (const subject of subjects) {
      for (const predicate of predicates) {
        for (const object of objects) {
          const quad = rdf.quad(subject.term, predicate.term, object.term,
            documentIRI)
          dataset.addAll([quad])
        }
      }
    }

    const labels = x => {
      return rdf.quad(x.term,
        rdf.namedNode('http://www.w3.org/2001/XMLSchema#label'),
        rdf.literal(x.label)),
        documentIRI
    }
    dataset.addAll(subjects.filter(x=>x.label).map(labels))
    dataset.addAll(predicates.filter(x=>x.label).map(labels))
    dataset.addAll(objects.filter(x=>x.label).filter(x=>x.term.termType==='NamedNode').map(labels))

    this.push(dataset)

    callback()
  }
}

export { ProduceDatasets }
