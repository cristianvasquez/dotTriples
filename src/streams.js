import { PassThrough } from 'stream'

// A simple stream that outputs JSON chunks
function createJsonPrinterOutput () {
  return new PassThrough({
    objectMode: true, write (chunk, encoding, callback) {
      console.log(JSON.stringify(chunk, null, 2))
      this.push(chunk)
      callback()
    },
  })
}

function createDatasetPrinterOutput () {
  return new PassThrough({
    objectMode: true, write (chunk, encoding, callback) {
      console.log(chunk.toString())
      this.push(chunk)
      callback()
    },
  })
}

export { createJsonPrinterOutput, createDatasetPrinterOutput }
