async function collect (readable) {
  const data = []
  for await (const chunk of readable) {
    data.push(chunk)
  }
  return data
}

export { collect }
