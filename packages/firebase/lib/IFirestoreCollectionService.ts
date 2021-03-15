import { FirestoreConverter, FirestorePluggableFilter } from './types'

export default interface IFirestoreCollectionService {
  outputFilters: FirestorePluggableFilter[]
  inputFilters: FirestorePluggableFilter[]
  defaultValues: any
  _map?: FirestoreConverter
  _compose?: FirestoreConverter
}
