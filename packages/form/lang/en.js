const enMessages = {
  required: 'Please provide %0',
  isEmail: '%0 should be valid email address',
  maxLength: '%0 shouldn\'t be longer than %3 characters',
  minLength: '%0 length should be %2 or greater',
  invalid: 'Invalid'
}

export default function getEnMessages () {
  return enMessages
}
