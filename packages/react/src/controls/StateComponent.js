import React, { Suspense } from 'react'

export default function StateComponent ({
  isLoading,
  loadingChildren,
  children
}) {
  const contents = isLoading ? loadingChildren : children

  return (
    <Suspense fallback={loadingChildren}>
      {contents}
    </Suspense>
  )
}
