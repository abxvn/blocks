import isIn from 'validator/lib/isIn'
import isEmail from 'validator/lib/isEmail'
import isDate from 'validator/lib/isDate'
import { isString } from 'lodash-es'

export const emptyValues = ['', null, undefined]
export const REQUIRED_RULE = 'required'

const TIME_REGEX = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/
const extraValidators = {
  [REQUIRED_RULE]: (value: string): boolean => !emptyValues.includes(value),
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  maxLength: (value: string, max: number): boolean => !value || value.length <= max,
  minLength: (value: string, min: number): boolean => Boolean(value) && value.length >= min,
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  in: (value: string, ...checkValues: string[]): boolean => isIn(value, checkValues),
  date: (value: string, format = 'YYYY/MM/DD'): boolean => isDate(value, { format }),
  time: (value: string): boolean => isString(value) && value.match(TIME_REGEX) !== null
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
