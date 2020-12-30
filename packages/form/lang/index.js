import en from './en'
import vi from './vi'

export default function getMessages (lang) {
  switch (lang) {
    case 'vi':
      return vi()
    default:
      return en()
  }
}

export const SUPPORTED_LANGS = [
  'en',
  'vi'
]
