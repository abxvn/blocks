export default function composeRemoveEmptyValues (service: any, input: any): any {
  const data: any = {}
  const emptyValues = ['', undefined]

  // Remove empty values
  for (const field in input) {
    if (!emptyValues.includes(input[field])) {
      data[field] = input[field]
    }
  }

  return data
}
