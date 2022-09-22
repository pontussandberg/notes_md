import { TKeyNumberValue } from "./types"

/**
 * Delay for function call
 */
export const timer = (
  delay: number,
  cb: Function
): any => {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve(cb())
    }, delay)
  })
}

export const setCssVariable = (
  key: string,
  value: string,
): void => {
  document.documentElement.style.setProperty(key, value)
}

export const getCssVariables = (
  keys: string[]
): TKeyNumberValue => {

  let result: TKeyNumberValue = {}

  for (const key_ of keys) {
    let value = 0

    if (typeof window !== "undefined") {
      value = parseInt(getComputedStyle(document.documentElement).getPropertyValue(key_).replace('px', ''))
    }

    const hyphenCase = key_.replace('--', '')
    const charArray = hyphenCase.split('')

    let keyName = ''
    let skipNext = false
    for (const [i, char] of charArray.entries()) {
      if (skipNext) {
        skipNext = false
        continue
      }

      if (char === '-') {
        keyName += charArray[i + 1].toUpperCase()
        skipNext = true
        continue
      }

      keyName += char
    }

    result[keyName] = value
  }
  return result
}

export const getRawCssVarianble = (
  key: string
): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(key)
}

export const getCssVariable = (
  key: string,
): number => {
  if (typeof window !== "undefined") {
    return parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(key)
        .replace('px', '')
        .replace('s', '')
    )
  }

  return 0
}