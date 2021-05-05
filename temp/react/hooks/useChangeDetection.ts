import React from 'react'

/**
 * Detect simple data changes, using JSON encode approach
 *
 * @param {Function} callback
 * @param {Array} dependencies
 */
export default function useChangeDetection (callback: React.EffectCallback, dependencies: any[]): void {
  React.useEffect(callback, dependencies.map(d => JSON.stringify(d)))
}
