import en from '../lang/en'
import { getKey, isString, isArray, hasKey } from './utils'

export const DEFAULT_LANG = 'en'

export default class TekuFormTranslator {
  private lang: string = DEFAULT_LANG
  private resources: {[key: string]: any} = {}

  constructor () {
    this.load(en)
  }

  setLang (lang: string): void {
    this.lang = lang
  }

  load (data: { lang: string, messages: any }): void {
    const { lang, messages } = data

    this.resources[lang] = messages
  }

  translate (texts: string[] | string): string {
    if (isString(texts)) {
      return getKey(this.resources, `${this.lang}.${texts as string}`, texts)
    } else if (isArray(texts)) {
      if (texts.length === 0) {
        throw TypeError('No texts provided for translations')
      }

      const lastFallbackText = texts[texts.length - 1]
      const firstFoundText = (texts as string[]).find(text => this.has(text))

      return firstFoundText !== undefined ? this.translate(firstFoundText) : lastFallbackText
    } else {
      throw TypeError('Only supports translations for string or a array of fallback texts')
    }
  }

  has (text: string): boolean {
    return hasKey(this.resources, `${this.lang}.${text}`)
  }
}
