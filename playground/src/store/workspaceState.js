import { Parser } from 'n3'
import { defineStore } from 'pinia'
import rdf from 'rdf-ext'
import { io } from 'socket.io-client'
import { ref, toRaw } from 'vue'
import {
  DIRECTORY,
  DIRECTORY_ERROR,
  TRIPLIFY,
  RETRIEVE_CONTENTS,
  RETRIEVE_CONTENTS_ERROR,
} from '../actions.js'
import ns from '../namespaces.js'
import { toTree } from './toTree.js'
const socket = io('ws://localhost:3000')
socket.open()

const parser = new Parser()

function toQuads (str) {
  return parser.parse(str)
}

export const useWorkspaceState = defineStore('current-selection-store',
  () => {
    const currentWorkspacePath = ref()
    const currentContainers = ref([])
    const currentSelection = ref([])
    const currentQuads = ref([])
    const currentContents = ref([])

    function doLoadWorkspace (workspacePath) {
      socket.emit(DIRECTORY, workspacePath)
    }

    socket.on(DIRECTORY, (arg) => {
      const quads = toQuads(arg)
      const dataset = rdf.dataset().addAll(quads)
      const pointer = rdf.clownface({ term: ns.dot.root, dataset })

      currentSelection.value = []
      currentContainers.value = toTree(pointer)
    })

    socket.on(DIRECTORY_ERROR, (arg) => {
      const error = JSON.parse(arg)
      currentSelection.value = []
      currentContainers.value = []
      console.log(error)
    })

    function doTriplify (uris) {
      const urisStr = JSON.stringify(toRaw(uris))
      socket.emit(TRIPLIFY, urisStr)
    }

    socket.on(TRIPLIFY, (arg) => {
      currentQuads.value = toQuads(arg)
    })

    // TODO, retrieve things with an index
    function doRetrieveContents (uris) {
      const urisStr = JSON.stringify(toRaw(uris))
      socket.emit(RETRIEVE_CONTENTS, urisStr)
    }

    socket.on(RETRIEVE_CONTENTS, (arg) => {
      currentContents.value = JSON.parse(arg)
    })

    socket.on(RETRIEVE_CONTENTS_ERROR, (arg) => {
      const error = JSON.parse(arg)
      currentContents.value = [error]
      console.log(error)
    })

    return {
      currentWorkspacePath,
      currentContainers,
      currentSelection,
      currentContents,
      currentQuads,
      doLoadWorkspace,
      doRetrieveContents,
      doTriplify,
    }
  })



