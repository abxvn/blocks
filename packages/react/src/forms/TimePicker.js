import React, { useEffect, useRef, useState } from 'react'
import Inputmask from 'inputmask'
import styled from 'styled-components'

export default function TimePicker ({ value, name, onChange, placeholder }) {
  // const [data, setData] = useState(value)
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

  // useEffect(() => {
  //   onChange && onChange(data)
  // }, [data])

  return (
    <TimePickerContainer className='time-picker'>
      <input
        type='text'
        placeholder={displayedPlaceHolder}
        className='form-control'
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
