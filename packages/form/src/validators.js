import isIn from 'validator/lib/isIn'
import isEmail from 'validator/lib/isEmail'

export const emptyValues = ['', null, undefined]
export const REQUIRED_RULE = 'required'
const extraValidators = {
  [REQUIRED_RULE]: value => !emptyValues.includes(value),
  maxLength: (value, max) => !value || value.length <= max,
  minLength: (value, min) => value && value.length >= min,
  in: (value, ...checkValues) => isIn(value, checkValues)
}

const validators = Object.assign({
  isEmail
}, extraValidators)

/**
 * Teku Form validators
 * Support a subset of validator library rules and custom rules
 *
 * @ref https://github.com/validatorjs/validator.js#validators
 */
export default validators
