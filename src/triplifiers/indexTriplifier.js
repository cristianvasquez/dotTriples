import rdf from 'rdf-ext'
import ns from '../namespaces.js'

function getParent (url) {
  return url.split('/').splice(0, url.split('/').length - 1).join('/')
}

function getName (url) {
  return url.split('/').splice(url.split('/').length - 1)[0]
}

function triplifyIndex (triplifier, options) {
  const dataset = rdf.dataset()

  const toUri = (path) => triplifier.termMapper.pathToUri(path, options)

  const nameToUri = (name) => {
    const { path } = triplifier.termMapper.getPathByName(name) || {}
    return toUri(path)
  }

  for (const filePath of triplifier.getFiles()) {
    const directoryPath = getParent(filePath)
    const containerUri = directoryPath === '' ? ns.dot.root : toUri(
      directoryPath)

    const fileUri = nameToUri(filePath)
    dataset.add(rdf.quad(containerUri, ns.dot.contains, fileUri, ns.dot.index))
    dataset.add(
      rdf.quad(fileUri, ns.schema.name, rdf.literal(getName(filePath)),
        ns.dot.index))
    dataset.add(rdf.quad(fileUri, ns.dot.path, rdf.literal(filePath), fileUri))
  }

  for (const directoryPath of triplifier.getDirectories()) {
    const parentDirectoryPath = getParent(directoryPath)
    const parentUri = parentDirectoryPath === '' ? ns.dot.root : toUri(
      parentDirectoryPath)
    const childUri = toUri(directoryPath)
    dataset.add(rdf.quad(parentUri, ns.dot.contains, childUri, ns.dot.index))
    dataset.add(
      rdf.quad(childUri, ns.schema.name, rdf.literal(getName(directoryPath)),
        ns.dot.index))
    dataset.add(rdf.quad(childUri, ns.rdf.type, ns.dot.Folder, ns.dot.index))
  }

  dataset.add(rdf.quad(ns.dot.root, ns.rdf.type, ns.dot.Folder, ns.dot.index))
  dataset.add(
    rdf.quad(ns.dot.root, ns.schema.name, rdf.literal('Root'), ns.dot.index))

  return rdf.clownface({ dataset, term: ns.dot.root })
}

export { triplifyIndex }
