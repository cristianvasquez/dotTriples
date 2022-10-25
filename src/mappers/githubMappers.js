import rdf from 'rdf-ext'
import ns from '../namespaces.js'

// @TODO
const GITHUB_URL = 'https://github.com/'

const createGithubMapper = (dataset, { fileUri }) => {

  function toQuads (repoUrl) {
    const result = []
    // https://github.com/cristianvasquez/prototype-11
    const [_, userName, repoName] = repoUrl.replaceAll(GITHUB_URL, '').
      split('/')

    if (!userName) {
      return result
    }
    const userUrl = `${GITHUB_URL}${userName}`
    const userIRI = rdf.namedNode(userUrl)

    result.push(rdf.quad(userIRI, ns.rdf.type, ns.dot.GithubRepo))
    result.push(rdf.quad(userIRI, ns.schema.name, rdf.literal(userName)))

    if (repoName) {
      const repoIRI = rdf.namedNode(repoUrl)
      result.push(rdf.quad(fileUri, ns.schema.about, repoIRI))
      result.push(rdf.quad(repoIRI, ns.rdf.type, ns.dot.GithubRepo))
      result.push(rdf.quad(userIRI, ns.dot.hasRepo, repoIRI))
      result.push(rdf.quad(repoIRI, ns.schema.name, rdf.literal(repoName)))
    }
    return result
  }

  const objects = rdf.termSet()
  for (const quad of [...dataset]) {
    objects.add(quad.subject)
  }
  const fromGithub = (iri) => iri.value.startsWith(GITHUB_URL)
  return [...objects].filter(fromGithub).map(toQuads).flat()
}

export { createGithubMapper }
