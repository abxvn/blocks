import React, { useEffect, useState } from 'react'
import useForm from '../hooks/useForm'

const withForm = (form, customOptions = {}) => {
  const defaultOptions = {
    bindFormRef: false,
    validateOnChanges: true,
    editMode: false,
    initData: {}
  }
  const options = Object.assign(defaultOptions, customOptions)

  return function withFormHOC (Component) {
    return function WithFormComponent ({ formRef, data, ...props }) {
      const [formErrors, setFormErrors] = useState({})
      const useFormOptions = {
        onError: setFormErrors
      }

      if (options.validateOnChanges) {
        useFormOptions.onChange = function () {
          this.validate()
        }
      }

      const formInitData = options.editMode
        ? Object.assign({}, options.initData, data)
        : Object.assign({}, options.initData)
      const [formData,, onFieldChanged] = useForm(form, formInitData, useFormOptions)

      useEffect(() => {
        if (options.bindFormRef && formRef) {
          formRef.current = form
        }
      }, [formRef])

      return <Component {...props} form={form} formData={formData} onFieldChanged={onFieldChanged} formErrors={formErrors} />
    }
  }
}

export default withForm
