import IFirestoreCollectionService from '../lib/IFirestoreCollectionService'

export default function mapDefaultValues (service: IFirestoreCollectionService, mappedValues: any): any {
  const data = mappedValues

  for (const field in service.defaultValues) {
    if (mappedValues[field] === null || mappedValues[field] === undefined) {
      data[field] = service.defaultValues[field]
    }
  }

  return data
}
