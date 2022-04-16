import kindOf from 'kind-of'

const has = (obj: any, key: string): boolean => Object.prototype.hasOwnProperty.call(obj, key)

export const omit = (obj: any, keys: string[]): any => {
  const result: any = {}

  forOwn(obj, (value, key) => {
    if (!keys.includes(key)) {
      result[key] = value
    }
  })

  return result
}

export const pick = (obj: any, keys: string[]): any => {
  const result: any = {}

  keys.forEach(key => {
    if (has(obj, key)) {
      result[key] = obj[key]
    }
  })

  return result
}

export const forOwn = (obj: any, iterator: (value: any, key: string) => void): void =>
  Object.keys(obj).forEach(key => iterator(obj[key], key))

// Simple function to get object value by path
export const get = (obj: any, path: string, defaultValue: any = undefined): any => {
  const result = String.prototype.split
    .call(path, /\./g)
    .filter(Boolean)
    .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj)

  return result === undefined || result === obj ? defaultValue : result
}

export const is = (checkedType: string | string[], data: any, path?: string): boolean => {
  const checkedValue = path !== undefined ? get(data, path) : data

  switch (kindOf(checkedType)) {
    case 'string':
      return checkedType === kindOf(checkedValue)
    case 'array':
      return (checkedType as string[]).some((t: string) => t === kindOf(checkedValue))
    default:
      // Silently ignore
      return false
  }
}

export { default as EventEmitter } from 'eventemitter3'
