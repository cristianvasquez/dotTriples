import rdf from 'rdf-ext'
import ns from '../namespaces.js'

function parent (url) {
  return url.split('/').splice(0, url.split('/').length - 1).join('/')
}

function createFolderMapper ({ baseNamespace }) {
  const subjects = rdf.termSet()

  return (dataset, { fileUri }) => {
    for (const quad of [...dataset]) {
      subjects.add(quad.subject)
    }
    const fromNamespace = (subject) => subject.value.startsWith(
      baseNamespace().value)

    const quads = [...subjects].filter(fromNamespace).map(subject => {
      return rdf.quad(subject, ns.dot.belongsTo,
        rdf.namedNode(parent(subject.value)), fileUri)
    })
    return rdf.dataset().addAll([...dataset, ...quads])
  }
}

export { createFolderMapper }
