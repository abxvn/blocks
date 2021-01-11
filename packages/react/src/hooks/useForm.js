import { useEffect, useState } from 'react'
import usePermaRef from './usePermaRef'
import useChangeDetection from './useChangeDetection'
import updateField from '../lib/updateField'

export default function useForm (form, data, { onError, onChange } = {}) {
  if (!form.getChanges && !form.merge) {
    throw TypeError('Teku form expected')
  }

  const formRef = usePermaRef(form)
  const [formData, setFormData] = useState(data) // eslint-disable-line no-unused-vars

  useEffect(function onMount () {
    formRef.init(formData)
    onError && formRef.on('error', onError)
    onChange && formRef.on('change', onChange)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useChangeDetection(function onDataChanged () {
    formRef.merge(formData)
  }, [formData]) // eslint-disable-line react-hooks/exhaustive-deps

  return [
    formData,
    setFormData,
    function onFieldChanged (ev) {
      setFormData(updateField(formData, ev))
    }
  ]
}
