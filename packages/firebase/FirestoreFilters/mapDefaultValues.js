export default function mapDefaultValues (mappedValues) {
  const data = mappedValues

  for (const field in this.defaultValues) {
    if (mappedValues[field] === null || mappedValues[field] === undefined) {
      data[field] = this.defaultValues[field]
    }
  }

  return data
}
