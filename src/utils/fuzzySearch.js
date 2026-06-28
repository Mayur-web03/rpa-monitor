// Fuzzy match: all words in query must appear somewhere in text (any order)
export function fuzzyMatch(text, query) {
  const haystack = text.toLowerCase()
  const words = query.toLowerCase().trim().split(/\s+/)
  return words.every(word => haystack.includes(word))
}