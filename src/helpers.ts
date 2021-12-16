/**
 * Delay for function call
 */
export const timer = (delay: number, cb: Function): any => {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve(cb())
    }, delay)
  })
}
