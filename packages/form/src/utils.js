import kindOf from 'kind-of'

export { upperFirst, get as getKey, omit, pick } from 'lodash-es'
export const isString = str => kindOf(str) === 'string'
export const isFunction = fn => kindOf(fn) === 'function'
export const diff = (newData, oldData, ignoreRemovedItems = false) => {
  const newKeys = Object.keys(newData)
  const oldKeys = Object.keys(oldData)
  const diffData = {}

  // pick different values
  newKeys.forEach(key => {
    if (newData[key] !== oldData[key]) {
      diffData[key] = newData[key]
    }
  })

  // pick removed keys
  !ignoreRemovedItems && oldKeys.forEach(key => {
    if (!newKeys.includes(key)) {
      diffData[key] = ''
    }
  })

  return diffData
}

export const updateField = (oldData, inputOrEvent, customFieldName) => {
  if (!inputOrEvent) {
    throw Error('Input or event should be provided')
  }

  const input = inputOrEvent.target
    ? inputOrEvent.target // event
    : inputOrEvent // element
  const inputType = input.type
  const fieldName = customFieldName ||
    input.name || // Normal input
    (input.getAttribute && input.getAttribute('data-field-name')) || // DOMElement
    (input.attr && input.data('field-name')) // jQuery
  let value

  if (!fieldName) {
    throw Error('No field name found')
  }

  if (inputType === 'radio' && !input.checked) {
    // ignore update
    return oldData
  }

  if (inputType === 'checkbox') {
    value = !!input.checked
  } else {
    value = input.value
  }

  return Object.assign({}, oldData, {
    [fieldName]: value
  })
}
