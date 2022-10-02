import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { ref } from 'vue'
import { DIRECTORY, DIRECTORY_ERROR } from '../actions.js'

const socket = io('ws://localhost:3000')
socket.open()

export const useWorkspaceState = defineStore('current-selection-store',
  () => {
    const currentWorkspacePath = ref()
    const currentContainers = ref([])
    const currentSelection = ref([])

    function doLoadWorkspace (workspacePath) {
      socket.emit(DIRECTORY, workspacePath)
    }

    socket.on(DIRECTORY, (arg) => {
      const directory = JSON.parse(arg)
      currentSelection.value = []
      currentContainers.value = directory.map((element, index) => ({
        label: element,
        key: index,
        isLeaf: true,
      }))
    })

    socket.on(DIRECTORY_ERROR, (arg) => {
      const error = JSON.parse(arg)
      currentSelection.value = []
      currentContainers.value = []
      console.log(error)
    })

    return {
      currentWorkspacePath,
      currentContainers,
      currentSelection,
      doLoadWorkspace,
    }
  })



