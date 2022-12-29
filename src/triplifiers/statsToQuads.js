import rdf from 'rdf-ext'
import ns from '../namespaces.js'

function getNameFromPath (filePath) {
  const fileName = filePath.split('/').slice(-1)[0]
  return fileName.endsWith('.md')
    ? fileName.split('.').slice(0, -1).join('.')
    : fileName
}

function statsToQuads ({ fileUri, path, stats }) {
  const { size, atime, mtime, ctime } = stats

  return [
    rdf.quad(fileUri, ns.rdf.type, ns.dot.Note, fileUri),
    rdf.quad(fileUri, ns.dot.path, rdf.literal(path), fileUri),
    rdf.quad(fileUri, ns.schema.name, rdf.literal(getNameFromPath(path)),
      fileUri),
    rdf.quad(fileUri, ns.dot.size, rdf.literal(size, ns.xsd.integer), fileUri),


    rdf.quad(fileUri, ns.dot.atime,
      rdf.literal(atime.toISOString(), ns.xsd.dateTime), fileUri),
    rdf.quad(fileUri, ns.dot.mtime,
      rdf.literal(mtime.toISOString(), ns.xsd.dateTime), fileUri),
    rdf.quad(fileUri, ns.dot.ctime,
      rdf.literal(ctime.toISOString(), ns.xsd.dateTime), fileUri)]
}

export { statsToQuads }
