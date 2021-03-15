import { useEffect, useState } from 'react'
import usePermaRef from './usePermaRef'
import useChangeDetection from './useChangeDetection'
import updateField from '../lib/updateField'

interface FormOptions {
  onError?: Function
  onChange?: Function
}
export default function useForm (form: any, data: any, { onError, onChange }: FormOptions = {}): [
  any,
  Function,
  Function
] {
  if (form === undefined || !(form.getChanges instanceof Function && form.merge instanceof Function)) {
    throw TypeError('Teku form expected')
  }

  const formRef = usePermaRef(form)
  const [formData, setFormData] = useState(data)

  useEffect(function onMount () {
    formRef.init(formData)
    ;(onError != null) && formRef.on('error', onError)
    ;(onChange != null) && formRef.on('change', onChange)
  }, [])

  useChangeDetection(function onDataChanged () {
    formRef.merge(formData)
  }, [formData])

  return [
    formData,
    setFormData,
    function onFieldChanged (ev: any) {
      setFormData(updateField(formData, ev))
    }
  ]
}
