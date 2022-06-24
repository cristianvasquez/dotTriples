const uriResolver = {
  uriFromSource: (source) => `URI[${source}]`,
  nameFromSource: (source) => `NAME[${source}]`,
  uriFromName: (name) => `URI[${name}]`
}
export { uriResolver }
