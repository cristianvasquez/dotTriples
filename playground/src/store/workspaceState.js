import { Parser } from 'n3'
import { defineStore } from 'pinia'
import rdf from 'rdf-ext'
import { io } from 'socket.io-client'
import { ref, toRaw, watch } from 'vue'
import {
  DIRECTORY,
  FOCUS_CONTENT,
  TRIPLIFY_FOCUS,
  TRIPLIFY_SELECTION,
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
  // The vault
    const currentWorkspacePath = ref()
  // The folders
    const currentContainers = ref([])
  // The things I checked
    const currentSelection = ref([])
    const currentSelectionQuads = ref([])
  // The current thing selected
    const currentFocus = ref()
    const currentFocusQuads = ref([])
    const currentFocusContents = ref([])

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

    watch(currentSelection, () => triplifySelection({ uris: currentSelection.value }))
    watch(currentFocus, () => triplifyFocus({ uri:currentFocus.value }))

    function triplifySelection ({ uris }) {
      socket.emit(TRIPLIFY_SELECTION, { uris: toRaw(uris) })
    }
    socket.on(TRIPLIFY_SELECTION, ({ turtle, error }) => {
      if (error) {
        currentSelectionQuads.value = []
        console.error(error)
      } else {
        currentSelectionQuads.value = toQuads(turtle)
      }
    })

    function triplifyFocus ({ uri }) {
      socket.emit(TRIPLIFY_FOCUS, { uri: toRaw(uri) })
    }
    socket.on(TRIPLIFY_FOCUS, ({ turtle, error }) => {
      if (error) {
        currentFocusQuads.value = []
        console.error(error)
      } else {
        currentFocusQuads.value = toQuads(turtle)
      }
    })

    function doRetrieveContents ({ uri }) {
      socket.emit(FOCUS_CONTENT, { uri: toRaw(uri) })
    }
    socket.on(FOCUS_CONTENT, ({ contents, error }) => {
      if (error){
        currentFocusContents.value = []
        console.error(error)
      } else {
        currentFocusContents.value = contents
      }
    })

    return {
      currentWorkspacePath,
      currentContainers,
      currentSelection,
      currentSelectionQuads,
      currentFocus,
      currentFocusQuads,
      currentFocusContents,
      doLoadWorkspace,
      doRetrieveContents,
    }
  })



