import { promises } from 'fs'
import { Server } from 'socket.io'
import { DIRECTORY, FILE } from './src/actions.js'

const io = new Server(3000, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  socket.emit('Hello world')

  socket.on(DIRECTORY, async (directory) => {
    const result = await promises.readdir(directory)
    socket.emit(DIRECTORY, JSON.stringify(result))
  })

  socket.on(FILE, async (file) => {
    promises.readFile(file)
    socket.emit(FILE, `The file is ${file}`)
  })
})
