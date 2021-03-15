export default function composeIgnoreDefaultValues (service: any, input: any): any {
  const data: any = {}

  for (const field in input) {
    // only copy values which aren't not set by default
    if (service.defaultValues[field] !== undefined || service.defaultValues[field] !== input[field]) {
      data[field] = input[field]
    }
  }

  return data
}
