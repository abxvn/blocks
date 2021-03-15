import EventEmitter from 'eventemitter3'
import { upperFirst, get as getKey, assign, zipObject, isString } from 'lodash-es'
import validators, { REQUIRED_RULE } from './lib/validators'
import TekuFormTranslator from './TekuFormTranslator'
import type {
  TranslateFn, ValidationErrors, ValidationFieldErrors, ValidationFn, ValidationRules
} from './lib/types'
import ITekuForm from './lib/ITekuForm'

const RULE_PARAMS_REGEX = /^[^:,]+:([^:,]+)+$/

export default class TekuForm extends EventEmitter implements ITekuForm {
  private readonly options: any = {}
  private readonly translator: TekuFormTranslator = new TekuFormTranslator()
  public translate: TranslateFn = str => this.translator.translate(str)
  private initData: any = {}
  private data: any = {}

  constructor (public readonly rules: ValidationRules, options = {}) {
    super()

    const defaultOptions = {
      // feature flags
      shouldFailFast: true,
      shouldValidate: true,
      shouldValidateChangesOnly: false
    }

    this.init({})
    this.options = assign(defaultOptions, options)
    this.options.validators = assign({}, validators, getKey(options, 'validators', null))
  }

  /**
   * Re-init form with data
   * @param {object} data
   */
  init (data: any): this {
    this.initData = assign({}, data)
    this.data = assign({}, data)

    return this
  }

  /**
   * Validate all fields
   */
  async validate (): Promise<ValidationErrors> {
    const fieldNames = (this.opt('shouldValidateChangesOnly') as boolean)
      ? Object.keys(this.getChanges())
      : Object.keys(this.data)

    const validations = fieldNames.map(async fieldName => await this.validateField(fieldName))
    const errorList: ValidationErrors = zipObject(fieldNames, await Promise.all(validations))

    return await Promise.all(validations)
      .then(() => {
        this.emit('error', errorList, this)

        return errorList
      })
  }

  /**
   * Force running validations on a field
   */
  async validateField (fieldName: string): Promise<ValidationFieldErrors> {
    const fieldValue = this.get(fieldName)
    const errors: ValidationFieldErrors = []

    let rules = this.rules[fieldName] ?? []

    if (isString(rules)) {
      rules = (rules).split('|')
    }

    // Ignore validate empty fields without 'required' rule
    if (!rules.includes(REQUIRED_RULE) && !validators.required(fieldValue)) {
      return errors
    }

    for (let idx = 0; idx < rules.length; idx++) {
      const { fn, name: ruleName, params } = this.getRule(rules[idx])

      try {
        const validateResult = fn(fieldValue)
        let result: boolean

        if ((validateResult as Promise<boolean>).then instanceof Function) {
          result = await validateResult
        } else {
          result = validateResult as boolean
        }

        if (!result) {
          errors.push(
            upperFirst(this.getErrorMessage(
              fieldName,
              ruleName,
              params
            ))
          )

          if (this.opt('shouldFailFast') as boolean) {
            break
          }
        }
      } catch (err) {
        errors.push(upperFirst(this.translate(err.message)))

        if (this.opt('shouldFailFast') as boolean) {
          break
        }
      }
    }

    return errors
  }

  merge (fieldValues) {
    const changes = diff(fieldValues, this.data, true)

    if (Object.keys(changes).length > 0) {
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

  opt (optName: string, defaultValue?: any): any {
    return getKey(this.options, optName, this.options[optName] ?? defaultValue)
  }

  /**
   * Get rule function, name and params
   *
   * @param {String|Function} rule rule
   */
  private getRule (rule: string | Function): { fn: ValidationFn, name: string, params: any } {
    let name: string = isString(rule) ? (rule) : (rule).name
    let params: any[] = []
    let fn: ValidationFn

    if (isString(rule)) {
      const ruleString: string = rule
      // for example, rule is in:1,10 or maxLength:30
      if (RULE_PARAMS_REGEX.test(ruleString)) {
        [name, ...params] = ruleString.split(/[:,]/)
      }

      if (isFunction(this.opt(`validators.${name}`))) {
        fn = this.opt(`validators.${name}`).bind(this)
      } else {
        throw Error(`Validator ${name} is not defined`)
      }

      if (params.length > 0) {
        fn = async (value: any): Promise<boolean> => await fn.apply(this, [value, ...params])
      }
    } else if (!isFunction(rule)) {
      throw Error('Invalid validator function')
    } else {
      fn = rule as ValidationFn
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
  getErrorMessage (fieldName: string, ruleName: string, params: any): string {
    // Support custom messages throw i18n option
    // Rule error message is nested in form.errors domain
    const messageTemplate = this.translate([
        `form.errors.${ruleName}`,
        'form.errors.invalid'
    ])
    const fieldValue = this.get(fieldName)
    const paramValues: any[] = [
      this.translate(fieldName),
      fieldValue,
      this.translate([
        `form.rules.${ruleName}`,
        ruleName
      ]),
      ...params
    ]

    return messageTemplate !== ''
      ? messageTemplate.replace(/%\d+/g, (bindParam: any) =>
        paramValues[bindParam.replace('%', '')] ?? bindParam
      )
      : ''
  }
}
