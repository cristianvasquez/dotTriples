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
import { DIRECTORY, LOG, RETRIEVE_CONTENTS, TRIPLIFY } from './src/actions.js'

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

function pointersInIndex (uris) {
  const isLeaf = ({ ptr }) => ns.dot.Folder.value !==
    ptr.out(ns.rdf.type).term?.value

  return uris.map(
    uri => {
      const ptr = rdf.clownface(
        { dataset: indexDataset, term: rdf.namedNode(uri) })
      const path = ptr.out(ns.dot.path).value
      return {
        ptr,
        path,
      }
    }).filter(isLeaf).filter(({ path }) => path.endsWith('.md'))
}

io.on('connection', (socket) => {

  function log (...args) {
    socket.emit(LOG, {
      date: new Date(),
      args,
    })
  }

  socket.on(DIRECTORY, async ({ path }) => {
    try {
      context = await createContext(
        { basePath: resolve(path), baseNamespace: vault, mappers })
      indexDataset = createIndexDataset(context)
      socket.emit(DIRECTORY, {
        turtle: indexDataset.toString(),
      })
    } catch (error) {
      console.error(error)
      socket.emit(DIRECTORY, { error })
    }
  })

  socket.on(TRIPLIFY, async ({ uris }) => {
    try {
      const paths = pointersInIndex(uris).map(({ path }) => path)

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
      const dataset = await collect(outputStream)

      socket.emit(TRIPLIFY, { turtle: dataset.toString() })
    } catch (error) {
      console.error(error)
      socket.emit(TRIPLIFY, { error })
    }
  })

  socket.on(RETRIEVE_CONTENTS, async ({ uris }) => {
    try {

      function readFiles (pointers) {
        return Promise.all(
          pointers.map(async ({ ptr, path }) => ({
            uri: ptr.term.value,
            buffer: await fs.readFile(resolve(context.basePath, path)),
          })),
        )
      }

      const pointers = pointersInIndex(uris)
      readFiles(pointers).then(fileContents => {
        const contents = fileContents.map(({ uri, buffer }) => ({
          uri,
          markdown: buffer.toString(),
        }))
        socket.emit(RETRIEVE_CONTENTS, { contents })
      })

    } catch (error) {
      console.error(error)
      socket.emit(RETRIEVE_CONTENTS, { error })
    }
  })

})
