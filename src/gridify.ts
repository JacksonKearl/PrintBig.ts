import { Jimp, TJimp, fill, positiveModulo } from "./utils"

const SQUARE_GRID_PIXELS = 1
const SQUARE_GRID_COLOR = [0, 0, 0, 255] as const

const DIAG_GRID_PIXELS = 1
const DIAG_GRID_COLOR = [0, 0, 0, 255] as const

const squareFill = fill(...SQUARE_GRID_COLOR)

export const gridify = (image: TJimp, density: number, gridSize: number) => {
  const grid = new (Jimp as any as typeof Jimp.default)(
    image.bitmap.width,
    image.bitmap.height,
    "#00000000"
  )
  if (gridSize) {
    // vertical
    for (let i = 0; i <= grid.bitmap.width; i += density * gridSize) {
      grid.scan(i, 0, SQUARE_GRID_PIXELS, grid.bitmap.height, squareFill)
    }

    // horizontal
    for (let j = 0; j <= grid.bitmap.height; j += density * gridSize) {
      grid.scan(0, j, grid.bitmap.width, SQUARE_GRID_PIXELS, squareFill)
    }

    // diagonal
    for (let j = 0; j < grid.bitmap.height; j++) {
      for (
        let i = 0;
        i < grid.bitmap.width;
        i += Math.round(density * gridSize)
      ) {
        for (let k = 0; k < DIAG_GRID_PIXELS; k++) {
          const diagRight =
            positiveModulo(j + k, Math.round(gridSize * density)) + i

          if (diagRight < grid.bitmap.width) {
            grid.setPixelColor(Jimp.rgbaToInt(...DIAG_GRID_COLOR), diagRight, j)
          }

          const diagLeft =
            positiveModulo(0 - j - k, Math.round(gridSize * density)) + i

          if (diagLeft < grid.bitmap.width) {
            grid.setPixelColor(Jimp.rgbaToInt(...DIAG_GRID_COLOR), diagLeft, j)
          }
        }
      }
    }
  }

  grid.composite(image, 0, 0, {
    mode: Jimp.BLEND_DESTINATION_OVER,
    opacityDest: 1,
    opacitySource: 1,
  })

  return grid
}
