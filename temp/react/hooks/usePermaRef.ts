import { useRef } from 'react'

export default function usePermaRef (ref: any): any {
  return usePermaRefAs<any>(ref)
}

export function usePermaRefAs<T> (ref: any): T {
  return useRef<T>(ref).current
}
