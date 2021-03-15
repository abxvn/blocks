export default function mapDefaultValues (service: any, mappedValues: any): any {
  const data = mappedValues

  for (const field in service.defaultValues) {
    if ([null, undefined].includes(mappedValues[field])) {
      data[field] = service.defaultValues[field]
    }
  }

  return data
}
