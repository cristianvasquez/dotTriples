const LINKS_REGEXP = /(\[\[[^\]\n]*\]\])/g

const URLS_REGEXP = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?!&//=]*)/gi

export { LINKS_REGEXP, URLS_REGEXP }
