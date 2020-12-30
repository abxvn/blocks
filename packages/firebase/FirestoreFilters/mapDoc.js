export default function mapDoc (doc) {
  if (this._map) {
    return this._map(doc) || null
  } else if (doc && doc.exists) {
    return doc.data()
  } else {
    return null
  }
}
