import React from 'react'
import styles from '../css/components/Button.module.css'

type ButtonProps = {
  type?: 'primary' | 'secondary'
  title: string
  onClick?: () => void
}


const Button = ({
  title,
  onClick = () => {},
  type = 'primary',
}: ButtonProps) => {

  const getStyles = () => {
    const classes = [styles.button]

    switch(type) {
      case 'primary':
        classes.push(styles.primary)
        break
      case 'secondary':
        classes.push(styles.secondary)
        break
    }

    return classes.join(' ')
  }

  return <button onClick={onClick} className={getStyles()}>{title}</button>
}

export default Button