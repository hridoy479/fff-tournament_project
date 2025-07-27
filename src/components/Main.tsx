import React from 'react'
import Header from './Header';
import Footer from './Footer';

export function Main(props:any) {
    const { children } = props;
  return (
    <div className='flex-1'>
        {children}
    </div>
  )
}

