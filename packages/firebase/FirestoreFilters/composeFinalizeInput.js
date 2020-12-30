export default function composeFinalizeInput (input) {
  return this._compose ? this._compose(input) : input
}
