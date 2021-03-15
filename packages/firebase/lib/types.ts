import IFirestoreCollectionService from './IFirestoreCollectionService'

export type FirestorePluggableFilter = (service: IFirestoreCollectionService, input: any) => any
export type FirestoreConverter = (doc: any) => any
