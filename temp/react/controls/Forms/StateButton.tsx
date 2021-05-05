import React from 'react'
import classnames from 'classnames'

interface StateButtonProps {
  className?: string
  isLoading?: boolean
  children: any
  loadingChildren: any
  disabled?: boolean
}
const StateButton: React.FC<StateButtonProps> = ({
  className,
  isLoading,
  children,
  loadingChildren,
  disabled,
  ...props
}: StateButtonProps) => {
  let contents = children

  if (Boolean(isLoading) && (loadingChildren != null)) {
    contents = loadingChildren
  }

  return (
    <button
      {...props}
      className={classnames('btn btn-primary', className)}
      disabled={Boolean(disabled) || isLoading}
    >
      {contents}
    </button>
  )
}

export default StateButton
