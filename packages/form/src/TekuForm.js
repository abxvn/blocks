import EventEmitter from 'eventemitter3'
import { diff, getKey, isFunction, isString, upperFirst } from './utils'
import getMessages, { SUPPORTED_LANGS } from '../lang'
import validators, { REQUIRED_RULE } from './validators'

export default class TekuForm extends EventEmitter {
  constructor (rules, initData = {}, options = {}) {
    super()

    const defaultOptions = {
      il8n: {},
      lang: DEFAULT_LANG,
      customValidators: {},
      // feature flags
      shouldFailFast: true,
      shouldValidate: true,
      shouldValidateChangesOnly: false
    }

    this.initData = initData
    this.rules = rules
    this.data = Object.assign({}, initData)
    this.options = Object.assign(defaultOptions, options)

    const lang = this.opt('lang')

    if (!SUPPORTED_LANGS.includes(lang)) {
      throw Error(`Unsupported language selected '${lang}''`)
    }
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

    const validations = fieldNames.map(fieldName => {
      return this.validateField(fieldName).then(fieldErrors => {
        if (fieldErrors.length) {
          errorList[fieldName] = fieldErrors
        }
      })
    })

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

      let validateResult = fn(fieldValue)

      if (validateResult.then) {
        validateResult = await validateResult
      }

      if (!validateResult) {
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
    }

    return errors
  }

  merge (fieldValues) {
    const changes = diff(fieldValues, this.data, true)

    if (Object.keys(changes).length) {
      this.data = Object.assign({}, this.data, changes)
      this.emit('change', changes, this)
    }
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

      if (isFunction(this.opt(`customValidators.${name}`))) {
        fn = this.opt(`customValidators.${name}`).bind(this)
      } else if (isFunction(validators[name])) {
        fn = validators[name].bind(this)
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
   * Support custom error messages throw il8n option, with rule error message nested in form.errors domain
   *
   * @param {string} fieldName
   * @param {string} ruleName
   * @param {any} params
   */
  _getErrorMessage (fieldName, ruleName, params) {
    const messages = getMessages(this.opt('lang'))
    const messageTemplate = this._translate(
      // Support custom messages throw il8n option
      // Rule error message is nested in form.errors domain
      `form.errors.${ruleName}`,
      getKey(messages, ruleName, messages.invalid)
    )
    const fieldValue = this.get(fieldName)
    const paramValues = [
      this._translate(fieldName),
      fieldValue,
      this._translateRuleName(ruleName),
      ...params
    ]

    return messageTemplate && messageTemplate.replace(/%\d+/g, bindParam =>
      paramValues[bindParam.replace('%', '')] || bindParam
    )
  }

  _translate (str, defaultMessage) {
    return this.opt(`il8n.${this.opt('lang')}.${str}`, defaultMessage || str)
  }

  _translateRuleName (ruleName, defaultMessage) {
    // Support custom rule name throw il8n option, with rule name nested in form.rules domain
    return this._translate(`form.rules.${ruleName}`, ruleName)
  }
}

const RULE_PARAMS_REGEX = /^[^:,]+:([^:,]+)+$/
const DEFAULT_LANG = 'en'

/**
 * A list of validation errors, grouped by field names
 * @typedef {{string, Array<string>}} ValidationErrorList
 */
