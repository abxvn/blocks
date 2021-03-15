import IFirestoreCollectionService from '../lib/IFirestoreCollectionService'

export default function composeFinalizeInput (service: IFirestoreCollectionService, input: any): any {
  return service._compose instanceof Function ? service._compose(input) : input
}
