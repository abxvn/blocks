import EventEmitter from 'eventemitter3'
import { diff, getKey, isFunction, isString, upperFirst, assign } from './utils'
import validators, { REQUIRED_RULE } from './validators'
import TekuFormTranslator from './TekuFormTranslator'

export default class TekuForm extends EventEmitter {
  constructor (rules, options = {}) {
    super()

    const defaultOptions = {
      // feature flags
      shouldFailFast: true,
      shouldValidate: true,
      shouldValidateChangesOnly: false
    }

    this.rules = rules
    this.init({})

    this.options = assign(defaultOptions, options)
    this.options.validators = assign({}, validators, getKey(options, 'validators', null))
    this.translator = new TekuFormTranslator()
    this.translate = str => this.translator.translate(str)
  }

  /**
   * Re-init form with data
   * @param {object} data
   */
  init (data) {
    this.initData = assign({}, data)
    this.data = assign({}, data)

    return this
  }

  /**
   * Validate all fields
   *
   * @return {Promise<ValidationErrorList>} resolves error list
   */
  async validate () {
    const errorList = {}

    const fieldNames = this.opt('shouldValidateChangesOnly')
      ? Object.keys(this.getChanges())
      : Object.keys(this.data)

    const validations = fieldNames.map(fieldName =>
      this.validateField(fieldName).then(fieldErrors => {
        if (fieldErrors.length) {
          errorList[fieldName] = fieldErrors
        }
      }))

    return Promise.all(validations)
      .then(() => {
        this.emit('error', errorList, this)

        return errorList
      })
  }

  /**
   * Force running validations on a field
   *
   * @param {string} fieldName
   * @return {Promise<Array<string>>} resolves a list of error messages
   */
  async validateField (fieldName) {
    const fieldValue = this.get(fieldName)
    const errors = []

    let rules = this.rules[fieldName] || []

    if (isString(rules)) {
      rules = rules.split('|')
    }

    // Ignore validate empty fields without 'required' rule
    if (!rules.includes(REQUIRED_RULE) && !validators.required(fieldValue)) {
      return errors
    }

    for (let idx = 0; idx < rules.length; idx++) {
      const { fn, name: ruleName, params } = this._getRule(rules[idx])

      try {
        let validateResult = fn(fieldValue)

        if (validateResult && validateResult.then) {
          validateResult = await validateResult
        }

        if (validateResult === false) {
          errors.push(
            upperFirst(this._getErrorMessage(
              fieldName,
              ruleName,
              params
            ))
          )

          if (this.opt('shouldFailFast')) {
            break
          }
        }
      } catch (err) {
        errors.push(upperFirst(this.translate(err.message)))

        if (this.opt('shouldFailFast')) {
          break
        }
      }
    }

    return errors
  }

  merge (fieldValues) {
    const changes = diff(fieldValues, this.data, true)

    if (Object.keys(changes).length) {
      this.data = assign({}, this.data, changes)
      this.emit('change', changes, this)
    }

    return this
  }

  get (fieldName) {
    return getKey(this.data, fieldName)
  }

  /**
   * Get change from init data
   */
  getChanges () {
    return diff(this.data, this.initData)
  }

  opt (optName, defaultValue) {
    return getKey(this.options, optName, this.options[optName] || defaultValue)
  }

  /**
   * Get rule function, name and params
   *
   * @param {String|Function} rule rule
   */
  _getRule (rule) {
    let name = isString(rule) ? rule : rule.name
    let fn = rule
    let params = []

    if (isString(rule)) {
      // for example, rule is in:1,10 or maxLength:30
      if (rule.match(RULE_PARAMS_REGEX)) {
        [name, ...params] = rule.split(/[:,]/)
      }

      if (isFunction(this.opt(`validators.${name}`))) {
        fn = this.opt(`validators.${name}`).bind(this)
      } else {
        throw Error(`Validator ${name} is not defined`)
      }

      if (params.length) {
        const oldFn = fn

        fn = value => oldFn.apply(this, [value, ...params])
      }
    } else if (!isFunction(rule)) {
      throw Error('Invalid validator function')
    }

    return {
      fn,
      name,
      params
    }
  }

  /**
   * Get error message for a field validation failure
   * Support custom error messages throw i18n option, with rule error message nested in form.errors domain
   *
   * @param {string} fieldName
   * @param {string} ruleName
   * @param {any} params
   */
  _getErrorMessage (fieldName, ruleName, params) {
    const messageTemplate = this.translate([
        // Support custom messages throw i18n option
        // Rule error message is nested in form.errors domain
        `form.errors.${ruleName}`,
        'form.errors.invalid'
    ])
    const fieldValue = this.get(fieldName)
    const paramValues = [
      this.translate(fieldName),
      fieldValue,
      this.translate([
        `form.rules.${ruleName}`,
        ruleName
      ]),
      ...params
    ]

    return messageTemplate && messageTemplate.replace(/%\d+/g, bindParam =>
      paramValues[bindParam.replace('%', '')] || bindParam
    )
  }
}

const RULE_PARAMS_REGEX = /^[^:,]+:([^:,]+)+$/

/**
 * A list of validation errors, grouped by field names
 * @typedef {{string, Array<string>}} ValidationErrorList
 */
