import { promises } from 'fs'
import { WebSocketServer } from 'ws'
import { DIRECTORY, FILE } from './src/actions.js'

const functions = {}
functions[DIRECTORY] = async (directory) => {
  try {
    return promises.readdir(directory)
  } catch (err) {
    console.error(`Error occurred while reading ${directory}`, err)
  }
}

functions[FILE] = async (directory) => (file) => {
  return 'The file is ' + file
}

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', function (ws) {

  ws.on('message', async (buffer) => {
    const data = buffer.toString()
    console.log('Received ', data)
    for (const [key, value] of Object.entries(functions)) {
      if (data.startsWith(key)) {
        const message = {
          key,
          data: await value(data.slice(key.length)),
        }
        ws.send(JSON.stringify(message))
      }
    }
  })

  ws.on('close', function () {
    console.log('close')
  })
})

const sendMemoryUsage = (ws) => {
  const id = setInterval(function () {
    ws.send(JSON.stringify(process.memoryUsage()), function () {
      //
      // Ignore errors.
      //
    })
  }, 100)
  console.log('started client interval')
  ws.on('close', function () {
    console.log('stopping client interval')
    clearInterval(id)
  })
}
