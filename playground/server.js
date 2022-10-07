import { promises as fs, watchFile, unwatchFile } from 'fs'
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
  FOCUS_CONTENT,
  TRIPLIFY_FOCUS,
  TRIPLIFY_SELECTION,
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


let currentlyWatched = undefined
io.on('connection', (socket) => {


  function setWatcher (result, uri) {

    if (result && !result.error && result.paths?.length) {
      const [path] = result.paths


      const listener = async (curr, prev) => {
        socket.emit(FOCUS_CONTENT, await retrieveContents({ uris: [uri] }))
        socket.emit(TRIPLIFY_FOCUS, await triplify({ uris: [uri] }))
      }

      const newPath = resolve(context.basePath, path)
      if (path && newPath !== currentlyWatched) {
        if(currentlyWatched){
          unwatchFile(currentlyWatched, listener)
        }
        currentlyWatched = newPath
        console.log('setting watcher to ',currentlyWatched)
        watchFile(currentlyWatched, {
          interval: 1000,
        }, listener);
      }
    }
  }

  socket.on(DIRECTORY, async ({ path }) => {
    socket.emit(DIRECTORY, await loadDirectory({ path }))
  })

  socket.on(TRIPLIFY_FOCUS, async ({ uri }) => {
    const result = await triplify({ uris: [uri] })
    setWatcher(result, uri)
    socket.emit(TRIPLIFY_FOCUS, result)
  })

  socket.on(FOCUS_CONTENT, async ({ uri }) => {
    const result = await retrieveContents({ uris: [uri] })
    setWatcher(result, uri)
    socket.emit(FOCUS_CONTENT, result)
  })

  socket.on(TRIPLIFY_SELECTION, async ({ uris }) => {
    socket.emit(TRIPLIFY_SELECTION, await triplify({ uris }))
  })

})

let context = undefined
let indexDataset = undefined
async function loadDirectory ({ path }) {
  try {
    context = await createContext(
      { basePath: resolve(path), baseNamespace: vault, mappers })
    indexDataset = createIndexDataset(context)
    return {
      turtle: indexDataset.toString(),
    }
  } catch (error) {
    console.error(error)
    return { error }
  }

}

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
    }).filter(isLeaf).filter(({ path }) => path && path.endsWith('.md'))
}

async function triplify ({ uris }) {
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

    return { turtle: dataset.toString(), paths }
  } catch (error) {
    console.error(error)
    return { error }
  }

}

async function retrieveContents ({ uris }) {
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
    const fileContents = await readFiles(pointers)
    const contents = fileContents.map(({ uri, buffer }) => ({
      uri,
      markdown: buffer.toString(),
    }))

    return { contents, paths: pointers.map(({ path }) => path) }

  } catch (error) {
    console.error(error)
    return { error }
  }
}
