import { useEffect } from 'react'
import styles from '../../css/button.module.css'
import { TGlassButtonProps } from '../../types'

const GlassButton = ({
  onClick,
  title,
  disabled = false,
  style = {},
}: TGlassButtonProps) => {

  useEffect(() => {
    console.log(style)
  },[])
  return (
    <button
      onClick={ onClick }
      className={ styles.glassButton }
      disabled={ disabled }
      style={ style }
    >
      { title }
    </button>
  )
}

export default GlassButton