import { useEffect, useState } from 'react'
import usePermaRef from './usePermaRef'

export default function useForm (form, { onError, onChange } = {}) {
  if (!form.getChanges && !form.merge) {
    throw TypeError('Teku form expected')
  }

  const formRef = usePermaRef(form)
  const [formData, setFormData] = useState(form.data) // eslint-disable-line no-unused-vars

  useEffect(() => {
    if (onError) {
      formRef.on('error', onError)
    }

    if (onChange) {
      formRef.on('change', () => {
        setFormData(form.data)
        onChange.apply(formRef, formRef.getChanges())
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return [
    formData,
    function onFieldChanged (ev) {
      formRef.merge(updateField(form.data, ev))
    }
  ]
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

  return {
    ...oldData,
    [fieldName]: value
  }
}
