import styles from '../css/PrimaryButton.module.css'

type PrimaryButtonProps = {
  title: string
  onClick: () => void
}

const PrimaryButton = ({title, onClick}: PrimaryButtonProps) => {
  return <button onClick={onClick} className={styles.primaryButton}>{title}</button>
}

export default PrimaryButton