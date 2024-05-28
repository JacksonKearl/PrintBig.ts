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

export const yieldThread = () =>
  new Promise((resolve) => setTimeout(resolve, 0))

export const emptyImage =
  "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
