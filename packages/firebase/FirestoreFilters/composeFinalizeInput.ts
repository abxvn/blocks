export default function composeFinalizeInput (service: any, input: any): any {
  return service._compose instanceof Function ? service._compose(input) : input
}
