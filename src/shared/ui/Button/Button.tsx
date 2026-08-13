import { forwardRef, type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function Button(props, ref) {
  return <button ref={ref} type="button" className={styles.button} {...props} />;
});
