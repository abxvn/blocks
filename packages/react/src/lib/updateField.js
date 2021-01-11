const updateField = (oldData, inputOrEvent, customFieldName) => {
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

export default updateField
