import React from 'react'

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
    <React.Suspense fallback={loadingChildren}>
      {contents}
    </React.Suspense>
  )
}

export default StateComponent
