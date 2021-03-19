import React, { ChangeEventHandler, useEffect, useRef } from 'react'
import classnames from 'classnames'
import Inputmask from 'inputmask'
import styled from 'styled-components'

interface TimePickerProps {
  id: string
  className?: string
  name: string
  value: any
  onChange: ChangeEventHandler<HTMLInputElement>
  placeholder?: string
}

const TimePicker: React.FC<TimePickerProps> = (props: TimePickerProps) => {
  const { id, className, value, name, onChange, placeholder } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const displayedPlaceHolder = placeholder ?? '--:--'

  useEffect(() => {
    const masker = new Inputmask({
      placeholder: displayedPlaceHolder,
      insertMode: false,
      showMaskOnHover: true,
      alias: 'datetime',
      inputFormat: 'HH:MM',
      outputFormat: 'HH:MM'
    })

    inputRef.current !== null && masker.mask(inputRef.current)
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

export default TimePicker

const TimePickerContainer = styled.div`
  display: flex;
  flex: 1 1 auto;

  input, .form-control {
    width: 0;
    flex-grow: 1;
  }
`
