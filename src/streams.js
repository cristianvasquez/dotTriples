import { PassThrough } from 'stream'

function printJsons () {
  return createOutputStream({
    forEach: (chunk => {
      console.log(JSON.stringify(chunk, null, 2))
    }),
  })
}

function printDatasets () {
  return createOutputStream({
    forEach: (chunk => {
      console.log(chunk.toString())
    }),
  })
}

function printDatasetCounts () {
  return new PassThrough({
    objectMode: true, write (dataset, encoding, callback) {
      this.count = this.count ? this.count + dataset.size : dataset.size
      console.log(`${this.count} quads`)
      this.push(dataset)
      callback()
    },
  })
}

function createOutputStream ({ forEach } = { forEach: x => x }) {
  return new PassThrough({
    objectMode: true, write (object, encoding, callback) {
      forEach(object)
      this.push(object)
      callback()
    },
  })
}

export {
  printJsons,
  printDatasets,
  printDatasetCounts,
  createOutputStream,
}
