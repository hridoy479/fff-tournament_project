import React from 'react'

export function Main(props:any) {
    const { children } = props;
  return (
    <div className='flex-1'>
        {children}
    </div>
  )
}

