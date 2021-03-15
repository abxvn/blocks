import { ValidationErrors } from './types'

export default interface ITekuForm {
  init: (data: any) => this
  validate: () => Promise<ValidationErrors>
}
