export default function composeIgnoreDefaultValues (input) {
  const data = {}

  for (const field in input) {
    // only copy values which aren't not set by default
    if (!this.defaultValues[field] || this.defaultValues[field] !== input[field]) {
      data[field] = input[field]
    }
  }

  return data
}
