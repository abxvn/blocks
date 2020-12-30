import React from 'react'
import classnames from 'classnames'
import styled, { keyframes } from 'styled-components'
import PropTypes from 'prop-types'

export default function InternalModal ({
  isShown,
  children,
  onClick,
  style,
  className
}) {
  if (!isShown) {
    return <></>
  }

  return (
    <Modal
      className={classnames('internal-modal', className)}
      tabIndex='-1'
      role='dialog'
      data-backdrop='false'
      aria-hidden={isShown}
      onClick={onClick}
    >
      <div
        className='modal-dialog modal-sm modal-dialog-centered'
        role='document'
      >
        <div className='modal-content'>
          {children}
        </div>
      </div>
    </Modal>
  )
}

InternalModal.propTypes = {
  style: PropTypes.string
}

const fadeInAnimation = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`
const Modal = styled.div`
  background: rgba(25, 25, 25, 0.5);
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;

  display: flex;
  justify-content: center;

  &.internal-modal--fadeIn {
    animation: ${fadeInAnimation} 0.3s ease-in-out;
  }
`
