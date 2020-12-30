import { useRef } from 'react'

export default function usePermaRef (ref) {
  return useRef(ref).current
}
