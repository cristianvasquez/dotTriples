import { Parser } from 'n3'
import { defineStore } from 'pinia'
import rdf from 'rdf-ext'
import { io } from 'socket.io-client'
import { ref, toRaw, watch } from 'vue'
import {
  DIRECTORY,
  LOG,
  RETRIEVE_CONTENTS,
  TRIPLIFY,
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
    const currentSelection = ref([])
    const currentContainers = ref([])
    const currentQuads = ref([])
    const currentContents = ref([])

    function appendLog ({ error, date, args }) {
      console.log(date, ...args) // Remote
    }

    socket.on(LOG, ({ date, args }) => {
      appendLog({ date, args })
    })

    function doLoadWorkspace ({ path }) {
      socket.emit(DIRECTORY, { path })
    }

    socket.on(DIRECTORY, ({ turtle, error }) => {
      if (error) {
        currentSelection.value = []
        currentContainers.value = []
        console.error(error)
      } else {
        const quads = toQuads(turtle)
        const dataset = rdf.dataset().addAll(quads)
        const pointer = rdf.clownface({ term: ns.dot.root, dataset })

        currentSelection.value = []
        currentContainers.value = toTree(pointer)
      }
    })

    watch(currentSelection, () => doTriplify({ uris: currentSelection.value }))

    function doTriplify ({ uris }) {
      socket.emit(TRIPLIFY, { uris: toRaw(uris) })
    }

    socket.on(TRIPLIFY, ({ turtle, error }) => {
      if (error) {
        currentQuads.value = []
        console.error(error)
      } else {
        currentQuads.value = toQuads(turtle)
      }
    })

    function doRetrieveContents ({ uris }) {
      socket.emit(RETRIEVE_CONTENTS, { uris: toRaw(uris) })
    }

    socket.on(RETRIEVE_CONTENTS, ({ contents, error }) => {
      if (error){
        currentContents.value = []
        console.error(error)
      } else {
        currentContents.value = contents
      }
    })

    return {
      currentWorkspacePath,
      currentContainers,
      currentSelection,
      currentContents,
      currentQuads,
      doLoadWorkspace,
      doRetrieveContents,
    }
  })



