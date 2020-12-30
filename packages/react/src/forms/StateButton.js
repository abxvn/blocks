import React from 'react'
import classnames from 'classnames'

export default function StateButton ({
  className,
  isLoading,
  children,
  loadingChildren,
  ...props
}) {
  let contents = children

  if (isLoading && loadingChildren) {
    contents = loadingChildren
  }

  return (
    <button
      {...props}
      className={classnames('btn btn-primary', className)}
      disabled={isLoading}
    >
      {contents}
    </button>
  )
}
