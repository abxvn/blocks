const messages = {
  required: 'Please provide %0',
  isEmail: '%0 should be valid email address',
  maxLength: '%0 shouldn\'t be longer than %3 characters',
  minLength: '%0 length should be %2 or greater',
  date: '%0 has invalid date format',
  time: '%0 has invalid time format',
  invalid: 'Invalid'
}

export default {
  lang: 'en',
  messages: {
    form: {
      errors: messages
    }
  }
}
