import { CollectionReference, DocumentReference, Query, DocumentData, OrderByDirection } from '@firebase/firestore-types'

import {
  composeRemoveEmptyValues,
  composeIgnoreDefaultValues,
  composeFinalizeInput,
  mapDefaultValues,
  mapDoc
} from './FirestoreFilters/'
import IFirestoreCollectionService from './lib/IFirestoreCollectionService'
import { FirestorePluggableFilter } from './lib/types'

export default class FirestoreCollectionService implements IFirestoreCollectionService {
  defaultLimit: number = 20
  defaultValues = {}

  /**
   * Map (output) filters
   */
  // These property mean to be adjustable on derived classes
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  outputFilters = [
    mapDoc,
    mapDefaultValues
  ]

  /**
   * Compose (output) filters
   */
  // These property mean to be adjustable on derived classes
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  inputFilters = [
    composeRemoveEmptyValues,
    composeIgnoreDefaultValues,
    composeFinalizeInput
  ]

  async getById (path: string): Promise<any> {
    const doc: any = this.getDocRef(path).get()

    return this.applyOutputFilters(doc)
  }

  watchById (path: string, next: Function): void {
    const docRef = this.getDocRef(path)

    docRef.onSnapshot((doc: any) => {
      next(this.applyOutputFilters(doc))
    })
  }

  async get (conditions: any[] = [], orders: {[key: string]: OrderByDirection} = {}, customLimit?: number): Promise<any[]> {
    const limit = (customLimit === undefined || customLimit === 0) ? this.defaultLimit : customLimit
    let query = this.collection() as Query<DocumentData>

    if (this.validArray(conditions)) {
      conditions.forEach(condition => {
        query = query.where.apply(query, condition)
      })
    }

    if (this.validObject(orders)) {
      for (const field in orders) {
        query = query.orderBy(field, orders[field])
      }
    }

    const list = await query.limit(limit).get() as unknown as any[]

    return list.map(doc => this.applyOutputFilters(doc))
  }

  async set (input: any): Promise<any> {
    const data = this.applyInputFilters(input)
    const id = data.id

    delete data.id

    if (id !== undefined) {
      return await this.collection().add(data)
    } else {
      return await this.getDocRef(id).set(data)
    }
  }

  collection (): CollectionReference {
    throw this.createError('collection should be provided')
  }

  private getDocRef (path: string): DocumentReference {
    return this.collection().doc(path)
  }

  private applyInputFilters (value: any): any {
    return this.apply(this.inputFilters, value)
  }

  private applyOutputFilters (value: any): any {
    return this.apply(this.outputFilters, value)
  }

  private apply (filters: FirestorePluggableFilter[], value: any): any {
    if (!this.validArray(filters)) {
      return value
    }

    let currentValue = value

    filters.forEach(fn => {
      currentValue = fn(this, currentValue)
    })

    return currentValue
  }

  private createError (message: string): Error {
    return Error(`${this.constructor.name} ${message}`)
  }

  private validObject (obj: any): boolean {
    return obj !== undefined && Object.keys(obj).length > 0
  }

  private validArray (arr: any): boolean {
    return arr !== undefined && arr.length > 0
  }
}
