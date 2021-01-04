import { useState } from 'react'

export default function TimePicker ({ value, onChange }) {
  const [data, setData] = useState(value)

  return (
    <div className='time-picker' />
  )
}
