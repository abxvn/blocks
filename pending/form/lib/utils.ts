import kindOf from 'kind-of'

export const is = (type: string, value: any): boolean => type === kindOf(value)
export const diff = (newData: any, oldData: any, ignoreRemovedItems = false): any => {
  const newKeys = Object.keys(newData)
  const oldKeys = Object.keys(oldData)
  const diffData: any = {}

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

export const updateField = (oldData: any, inputOrEvent: any, customFieldName = ''): void => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!inputOrEvent) {
    throw Error('Input or event should be provided')
  }

  const input = inputOrEvent.target instanceof Element
    ? inputOrEvent.target // event
    : inputOrEvent // element
  const inputType: string = input.type
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const fieldName: string = customFieldName ||
    input.name as string || // Normal input
    (input.getAttribute instanceof Function && ('data-field-name')) || // DOMElement
    (input.data instanceof Function && input.data('field-name')) // jQuery

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!fieldName) {
    throw Error('No field name found')
  }

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (inputType === 'radio' && !input.checked) {
    // ignore update
    return oldData
  }

  let value: any

  if (inputType === 'checkbox') {
    value = Boolean(input.checked)
  } else {
    value = input.value
  }

  return Object.assign({}, oldData, {
    [fieldName]: value
  })
}
