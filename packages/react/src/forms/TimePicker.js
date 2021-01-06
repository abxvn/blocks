import React, { useEffect, useRef } from 'react'
import classnames from 'classnames'
import Inputmask from 'inputmask'
import styled from 'styled-components'

export default function TimePicker ({ id, className, value, name, onChange, placeholder }) {
  const inputRef = useRef()
  const displayedPlaceHolder = placeholder || '--:--'

  useEffect(() => {
    const masker = new Inputmask({
      placeholder: displayedPlaceHolder,
      insertMode: false,
      showMaskOnHover: true,
      alias: 'datetime',
      inputFormat: 'HH:MM',
      outputFormat: 'HH:MM'
    })

    masker.mask(inputRef.current)
  }, [])

  return (
    <TimePickerContainer className='time-picker'>
      <input
        id={id}
        type='text'
        placeholder={displayedPlaceHolder}
        className={classnames('form-control', className)}
        name={name}
        value={value}
        ref={inputRef}
        onChange={onChange}
      />
    </TimePickerContainer>
  )
}

const TimePickerContainer = styled.div`
  display: flex;
  flex: 1 1 auto;

  input, .form-control {
    width: 0;
    flex-grow: 1;
  }
`
