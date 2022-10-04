import { promises as fs } from 'fs'
import { resolve } from 'path'
import rdf from 'rdf-ext'
import { Server } from 'socket.io'
import { PassThrough } from 'stream'

import {
  createContext,
  createIndexDataset,
  createMarkdownPipeline,
} from '../index.js'
import ns from '../src/namespaces.js'
import {
  DIRECTORY,
  DIRECTORY_ERROR,
  RETRIEVE_CONTENTS,
  RETRIEVE_CONTENTS_ERROR,
  TRIPLIFY,
  TRIPLIFY_ERROR,
} from './src/actions.js'

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

function urisToPaths (uris) {
  const isLeaf = (ptr) => ns.dot.Folder.value !==
    ptr.out(ns.rdf.type).term?.value

  return uris.map(
    uri => rdf.clownface({ dataset: indexDataset, term: rdf.namedNode(uri) })).
    filter(isLeaf).
    map(ptr => ptr.out(ns.dot.path).value).filter(path => path.endsWith('.md'))
}

io.on('connection', (socket) => {

  socket.on(DIRECTORY, async (directory) => {
    // console.log(DIRECTORY, directory)
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
    // console.log(TRIPLIFY, payLoad)
    try {
      const uris = JSON.parse(payLoad)
      const paths = urisToPaths(uris)

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

  socket.on(RETRIEVE_CONTENTS, async (payLoad) => {
    // console.log(RETRIEVE_CONTENTS, payLoad)
    try {
      const uris = JSON.parse(payLoad)
      const paths = urisToPaths(uris)

      const absolutePaths = paths.map(path => resolve(context.basePath, path))

      function readFiles (files) {
        return Promise.all(
          files.map(path => fs.readFile(path)),
        )
      }

      readFiles(absolutePaths).then(fileContents => {
        socket.emit(RETRIEVE_CONTENTS,
          JSON.stringify(fileContents.map(buffer => buffer.toString())))
      })

    } catch (error) {
      socket.emit(RETRIEVE_CONTENTS_ERROR, JSON.stringify(error))
    }
  })

})
