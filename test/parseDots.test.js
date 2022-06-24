import {expect} from 'expect'

import toMatchSnapshot from 'expect-mocha-snapshot'

expect.extend({ toMatchSnapshot })

const phrases = [
  'properties :: and values are separated by double colons',
]

const phrases_with_links = [
  'property :: [[Value]]',
  'property :: [value](http://example.org)'
]

describe('[parseDots]', function () {

  phrases.forEach((current) => {
    it(`"${current}"`, async function () {
      expect({
        size: 0,
        triples: [],
      }).toMatchSnapshot(this)
    })
  })

})
