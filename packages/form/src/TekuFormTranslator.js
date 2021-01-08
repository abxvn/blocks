import en from '../lang/en'
import { getKey, isString, isArray, hasKey } from './utils'

export const DEFAULT_LANG = 'en'

export default class TekuFormTranslator {
  constructor () {
    this.resources = {}
    this.lang = DEFAULT_LANG
    this.load(en)
  }

  load ({ lang, messages }) {
    this.resources[lang] = messages
  }

  translate (texts) {
    if (isString(texts)) {
      return getKey(this.resources, `${this.lang}.${texts}`, texts)
    } else if (isArray(texts)) {
      if (!texts.length) {
        throw TypeError('No texts provided for translations')
      }

      const lastFallbackText = texts[texts.length - 1]
      const firstFoundText = texts.find(text => this.has(text))

      return firstFoundText ? this.translate(firstFoundText) : lastFallbackText
    } else {
      throw TypeError('Only supports translations for string or a array of fallback texts')
    }
  }

  has (text) {
    return hasKey(this.resources, `${this.lang}.${text}`)
  }
}
