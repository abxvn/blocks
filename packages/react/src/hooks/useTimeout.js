import { useEffect } from 'react/cjs/react.development'

export default function useTimeout (fn, delayInMilliseconds) {
  useEffect(() => {
    const timer = setTimeout(() => {
      fn()

      return () => clearTimeout(timer)
    }, delayInMilliseconds)
  })
}
