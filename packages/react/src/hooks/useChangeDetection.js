import { useEffect } from 'react'

/**
 * Detect simple data changes, using JSON encode approach
 *
 * @param {Function} callback
 * @param {Array} dependencies
 */
export default function useChangeDetection (callback, dependencies) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, dependencies.map(d => JSON.stringify(d)))
}
