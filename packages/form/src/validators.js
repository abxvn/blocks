import isIn from 'validator/lib/isIn'
import isEmail from 'validator/lib/isEmail'
import isDate from 'validator/lib/isDate'

export const emptyValues = ['', null, undefined]
export const REQUIRED_RULE = 'required'

const TIME_REGEX = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/
const extraValidators = {
  [REQUIRED_RULE]: value => !emptyValues.includes(value),
  maxLength: (value, max) => !value || value.length <= max,
  minLength: (value, min) => value && value.length >= min,
  in: (value, ...checkValues) => isIn(value, checkValues),
  date: (value, format = 'YYYY/MM/DD') => isDate(value, { format }),
  time: value => value.match(TIME_REGEX)
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
