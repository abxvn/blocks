import React, { ComponentType, FC, MutableRefObject, useEffect, useState } from 'react'
import useForm from '../../hooks/useForm'

interface WithFormOptions {
  bindFormRef?: boolean
  validateOnChanges?: boolean
  editMode?: boolean
  initData?: any
}
type IWithForm = (form: any, customOptions: WithFormOptions) => (component: ComponentType) => any
interface WithFormComponentProps {
  formRef?: MutableRefObject<any>
  data: any
}
interface FormOptions {
  onError?: Function
  onChange?: Function
}
const withForm: IWithForm = (form: any, customOptions: WithFormOptions = {}) => {
  const defaultOptions = {
    bindFormRef: false,
    validateOnChanges: true,
    editMode: false,
    initData: {}
  }
  const options = Object.assign(defaultOptions, customOptions)

  return function withFormHOC (Component) {
    const WithFormComponent: FC<WithFormComponentProps> = ({ formRef, data, ...props }: WithFormComponentProps) => {
      const [formErrors, setFormErrors] = useState({})
      const useFormOptions: FormOptions = {
        onError: setFormErrors
      }

      if (options.validateOnChanges) {
        useFormOptions.onChange = function () {
          // @ts-expect-error
          this.validate()
        }
      }

      const formInitData = options.editMode
        ? Object.assign({}, options.initData, data)
        : Object.assign({}, options.initData)
      const [formData,, onFieldChanged] = useForm(form, formInitData, useFormOptions)

      useEffect(() => {
        if (options.bindFormRef && (formRef != null)) {
          formRef.current = form
        }
      }, [formRef])

      return (
        <Component
          {...props}
          // @ts-expect-error
          form={form}
          formData={formData}
          onFieldChanged={onFieldChanged}
          formErrors={formErrors}
        />
      )
    }

    return WithFormComponent
  }
}

export default withForm
