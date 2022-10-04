import { Parser } from 'n3'
import { defineStore } from 'pinia'
import rdf from 'rdf-ext'
import { io } from 'socket.io-client'
import { ref, toRaw } from 'vue'
import { DIRECTORY, DIRECTORY_ERROR, TRIPLIFY } from '../actions.js'
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
      const triplify = JSON.stringify(toRaw(uris))
      socket.emit(TRIPLIFY, triplify)
    }

    socket.on(TRIPLIFY, (arg) => {
      currentQuads.value = toQuads(arg)
    })

    return {
      currentWorkspacePath,
      currentContainers,
      currentSelection,
      doLoadWorkspace,
      doTriplify,
      currentQuads,
    }
  })



