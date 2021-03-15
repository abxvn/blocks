export default function mapDoc (service: any, doc: any): any {
  if (service._map instanceof Function) {
    return service._map(doc)
  } else if (doc?.exists === true) {
    return doc.data()
  } else {
    return null
  }
}
