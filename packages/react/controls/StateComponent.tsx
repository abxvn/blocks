import React, { Suspense } from 'react'

interface StateComponentProps {
  isLoading: boolean
  loadingChildren: any
  children: any
}
const StateComponent: React.FC<StateComponentProps> = ({
  isLoading,
  loadingChildren,
  children
}: StateComponentProps) => {
  const contents = isLoading ? loadingChildren : children

  return (
    <Suspense fallback={loadingChildren}>
      {contents}
    </Suspense>
  )
}

export default StateComponent
