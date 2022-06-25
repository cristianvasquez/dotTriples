import { getNameFromPath } from './buildIndex.js'

function createUriResolver (index) {
  return {
    uriFromPath: (path) => `URIfromPath[${path}]`,
    nameFromPath: getNameFromPath,
    uriFromName: (name) => `URIfromName[${name}]`
  }

}

export { createUriResolver }
