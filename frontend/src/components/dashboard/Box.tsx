import React from 'react'

interface Props{
    children: React.ReactNode,
    extraClasses?: string
}

const Box = ({children,extraClasses}: Props) => {
  return (
    <section className={`dash-box ${extraClasses}`}>
        {children}
    </section>
  )
}

export default Box