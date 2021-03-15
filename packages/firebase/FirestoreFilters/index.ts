import composeFinalizeInput from './composeFinalizeInput'
import composeIgnoreDefaultValues from './composeIgnoreDefaultValues'
import composeRemoveEmptyValues from './composeRemoveEmptyValues'
import mapDefaultValues from './mapDefaultValues'
import mapDoc from './mapDoc'

export default {
  // Map filters
  mapDoc,
  mapDefaultValues,

  // Compose filter
  composeFinalizeInput,
  composeIgnoreDefaultValues,
  composeRemoveEmptyValues
}
