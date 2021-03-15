import { EffectCallback, useEffect } from 'react'

/**
 * Detect simple data changes, using JSON encode approach
 *
 * @param {Function} callback
 * @param {Array} dependencies
 */
export default function useChangeDetection (callback: EffectCallback, dependencies: any[]): void {
  useEffect(callback, dependencies.map(d => JSON.stringify(d)))
}
