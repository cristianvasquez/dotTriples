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

function createDatasetPrinterOutput ({ onlyCounts } = { onlyCounts: false }) {
  return new PassThrough({
    objectMode: true, write (dataset, encoding, callback) {
      if (onlyCounts) {
        this.count = this.count ? this.count + dataset.size : dataset.size
        console.log(`${this.count} quads`)
      } else {
        console.log(dataset.toString())
      }
      this.push(dataset)
      callback()
    },
  })
}

export { createJsonPrinterOutput, createDatasetPrinterOutput }
