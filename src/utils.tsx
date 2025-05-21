import * as TJimp from "jimp"
import "jimp"
const { Jimp } = window as any as { Jimp: typeof TJimp }

export { Jimp, TJimp }

export const fill = (r: number, g: number, b: number, a: number) =>
  function (this: TJimp, x: number, y: number, i: number) {
    this.bitmap.data[i] = r
    this.bitmap.data[i + 1] = g
    this.bitmap.data[i + 2] = b
    this.bitmap.data[i + 3] = a
  }

export const positiveModulo = (i: number, n: number) => ((i % n) + n) % n

export const round = (n: number, precision: number = 0) =>
  Math.round(n * 10 ** precision) / 10 ** precision

export const yieldThreadOrDie = (signal: AbortSignal) => {
  return new Promise<void>((resolve, reject) =>
    setTimeout(() => {
      if (signal.aborted) {
        reject("Aborted")
      } else {
        resolve()
      }
    }, 0)
  )
}

export const emptyImage =
  "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="

import { useState, useEffect, useCallback } from "react"

function useQueryState<T>(key: string, defaultValue: T) {
  // Function to get the value from the query string
  const getQueryParam = useCallback((): T => {
    const searchParams = new URLSearchParams(window.location.search)
    const param = searchParams.get(key)
    if (param !== null) {
      try {
        return JSON.parse(param) as T
      } catch {
        // Fallback if parsing fails
        return param as unknown as T
      }
    }
    return defaultValue
  }, [key, defaultValue])

  const [state, setState] = useState<T>(getQueryParam)

  useEffect(() => {
    const handlePopState = () => {
      const currentParam = getQueryParam()
      if (currentParam !== state) {
        setState(currentParam)
      }
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [getQueryParam, state])

  const setQueryState = useCallback(
    (value: T | ((prevState: T) => T)) => {
      setState((prevState) => {
        const newValue = value instanceof Function ? value(prevState) : value
        const searchParams = new URLSearchParams(window.location.search)
        if (newValue === defaultValue) {
          searchParams.delete(key)
        } else {
          searchParams.set(key, JSON.stringify(newValue))
        }
        const newUrl = `${window.location.pathname}?${searchParams.toString()}`
        window.history.replaceState(null, "", newUrl)
        return newValue
      })
    },
    [key, defaultValue]
  )

  return [state, setQueryState] as const
}

export default useQueryState
