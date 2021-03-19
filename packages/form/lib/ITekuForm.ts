import { ValidationErrors, ValidationFieldErrors } from './types'

export default interface ITekuForm {
  init: (data: any) => this
  validate: () => Promise<ValidationErrors>
  validateField: (fieldName: string) => Promise<ValidationFieldErrors>
}
