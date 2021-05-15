import _get from 'lodash-es/get'
import kindOf from 'kind-of'

export { default as each } from 'lodash-es/each'
export { default as pick } from 'lodash-es/pick'
export { default as omit } from 'lodash-es/omit'

export const get = _get
export const typeOf = kindOf
export const is = (checkedType: string | string[], data: any, path?: string): boolean => {
  const checkedValue = path !== undefined ? get(data, path) : data

  switch (typeOf(checkedType)) {
    case 'string':
      return checkedType === typeOf(checkedValue)
    case 'array':
      return (checkedType as string[]).some((t: string) => t === typeOf(checkedValue))
    default:
      // Silently ignore
      return false
  }
}

export { default as EventEmitter } from 'eventemitter3'
