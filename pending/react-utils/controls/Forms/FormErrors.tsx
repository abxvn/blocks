import React from 'react'

interface FormErrorsProps {
  errors?: string[]
}

const FormErrors: React.FC<FormErrorsProps> = ({ errors }: FormErrorsProps) => {
  if (errors !== undefined && errors !== null && (errors.length > 0)) {
    return (
      <ul className='state-form__errors list-unstyled text-danger'>
        {errors.map(message => <li key={message}>{message}</li>)}
      </ul>
    )
  } else {
    return <></>
  }
}

export default FormErrors
