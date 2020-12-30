import composeRemoveEmptyValues from './FirestoreFilters/composeRemoveEmptyValues'
import composeIgnoreDefaultValues from './FirestoreFilters/composeIgnoreDefaultValues'
import composeFinalizeInput from './FirestoreFilters/composeFinalizeInput'
import mapDefaultValues from './FirestoreFilters/mapDefaultValues'
import mapDoc from './FirestoreFilters/mapDoc'

export default class FirestoreCollectionService {
  constructor () {
    this.defaultLimit = 20
    this.defaultValues = {}
    this.mapFilters = [
      mapDoc.bind(this),
      mapDefaultValues.bind(this)
    ]
    this.composeFilters = [
      composeRemoveEmptyValues.bind(this),
      composeIgnoreDefaultValues.bind(this),
      composeFinalizeInput.bind(this)
    ]
  }

  async getById (path) {
    return this._getDocRef(path).get().then(doc => this._apply('mapFilters', doc))
  }

  watchById (path, next) {
    return this._getDocRef(path).onSnapshot(doc => {
      next(this._apply('mapFilters', doc))
    })
  }

  async get (conditions = [], orders = {}, customLimit = 0) {
    const limit = customLimit || this.defaultLimit
    let query = this.collection()

    if (this._validArray(conditions)) {
      conditions.forEach(condition => {
        query = query.where.apply(query, condition)
      })
    }

    if (this._validObject(orders)) {
      for (const field in orders) {
        const order = orders[field]

        query = query.orderBy(field, order)
      }
    }

    const getList = query.limit(limit).get()

    return getList.then(list => list.map(doc => this._apply('mapFilters', doc)))
  }

  async set (input) {
    const { id, ...data } = this._apply('composeFilters', input)

    if (!id) {
      this.collection().add(data)
    } else {
      this._getDocRef(id).set(data)
    }
  }

  collection () {
    throw this._createError('collection should be provided')
  }

  _getDocRef (path) {
    return this.collection().doc(path)
  }

  _apply (filterName, value) {
    const filters = this[filterName]

    if (!this._validArray(filters)) {
      return value
    }

    let currentValue = value

    filters.forEach(fn => {
      currentValue = fn(currentValue)
    })

    return currentValue
  }

  _createError (message) {
    return Error(`${this.constructor.name} ${message}`)
  }

  _validObject (obj) {
    return obj && Object.keys(obj).length > 0
  }

  _validArray (arr) {
    return arr && arr.length > 0
  }
}
