import React from 'react'
import PropTypes from 'prop-types'

export default function FormErrors ({ errors }) {
  if (errors && errors.length) {
    return (
      <ul className='state-form__errors list-unstyled text-danger'>
        {errors.map(message => <li key={message}>{message}</li>)}
      </ul>
    )
  } else {
    return <></>
  }
}

FormErrors.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.string)
}
