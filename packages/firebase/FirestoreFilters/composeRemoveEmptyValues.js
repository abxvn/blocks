export default function composeRemoveEmptyValues (input) {
  const data = {}

  for (const field in input) {
    // only copy values which aren't not set by default
    if (input[field]) {
      data[field] = input[field]
    }
  }

  return data
}
