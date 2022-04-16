export interface MessageData {
  lang: string
  messages: any
}

export type TranslateFn = (str: string | string[]) => string
export interface ValidationErrors {
  [key: string]: ValidationFieldErrors
}
export type ValidationFn = (...args: any[]) => boolean | Promise<boolean>
export type ValidationFieldErrors = string[]
export interface ValidationRules {
  [key: string]: Array<string | Function> | string
}
