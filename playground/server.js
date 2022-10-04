import { resolve } from 'path'
import rdf from 'rdf-ext'
import { Server } from 'socket.io'
import { PassThrough } from 'stream'
import { createContext, createIndexDataset, createMarkdownPipeline } from '../index.js'
import ns from '../src/namespaces.js'
import { DIRECTORY, DIRECTORY_ERROR, TRIPLIFY, TRIPLIFY_ERROR } from './src/actions.js'

const io = new Server(3000, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

const vault = ns.ex
const mappers = {
  'is a': ns.rdf.type,
  'are': ns.rdf.type,
  'foaf:knows': ns.foaf.knows,
}

let context = undefined
let indexDataset = undefined

async function collect (readable) {
  const result = rdf.dataset()
  for await (const dataset of readable) {
    result.addAll([...dataset])
  }
  return result
}

io.on('connection', (socket) => {

  socket.on(DIRECTORY, async (directory) => {
    try {
      context = await createContext(
        { basePath: resolve(directory), baseNamespace: vault, mappers })
      indexDataset = createIndexDataset(context)
      // const result = await promises.readdir(directory + '/')
      socket.emit(DIRECTORY, indexDataset.toString())
    } catch (error) {
      socket.emit(DIRECTORY_ERROR, JSON.stringify(error))
    }
  })

  socket.on(TRIPLIFY, async (payLoad) => {
    try {
      const uris = JSON.parse(payLoad)

      const isLeaf = (ptr) => ns.dot.Folder.value !==
        ptr.out(ns.rdf.type).term?.value

      const paths = uris.map(uri => rdf.clownface( {dataset:indexDataset, term:rdf.namedNode(uri)})).
        filter(isLeaf).
        map(ptr => ptr.out(ns.dot.path).value).filter(path => path.endsWith('.md'))

      const outputStream = new PassThrough({
        objectMode: true, write (object, encoding, callback) {
          this.push(object)
          callback()
        },
      })
      const inputStream = createMarkdownPipeline(context, { outputStream })
      for (const file of paths) {
        inputStream.write(file)
      }
      inputStream.end()
      const result = await collect(outputStream)

      socket.emit(TRIPLIFY, result.toString())
    } catch (error) {
      socket.emit(TRIPLIFY_ERROR, JSON.stringify(error))
    }
  })

})
