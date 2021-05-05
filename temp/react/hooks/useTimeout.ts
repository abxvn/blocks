import { useEffect } from 'react'

export default function useTimeout (fn: Function, delayInMilliseconds: number): void {
  useEffect(() => {
    const timer = setTimeout(() => {
      fn()

      return () => clearTimeout(timer)
    }, delayInMilliseconds)
  })
}
