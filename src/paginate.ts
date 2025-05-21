import { Jimp, TJimp, fill, round, yieldThreadOrDie } from "./utils"

export type TilingConfig = {
  width: number
  height: number
  overlap: number
  density: number
}

export type Handlers = {
  onPage: (image: string | null) => void
  onRow: () => void
  onStatus: (status: string) => void
}

export const paginate = async ({
  gridImage,
  originalImage,
  tilingConfig,
  handlers,
  signal,
}: {
  gridImage: TJimp
  originalImage: TJimp
  tilingConfig: TilingConfig
  handlers: Handlers
  signal: AbortSignal
}): Promise<{
  totalPages: number
  totalWidth: number
  totalHeight: number
}> => {
  const pageGrid: (string | null)[][] = []

  const maxWidth = tilingConfig.width * tilingConfig.density
  const maxHeight = tilingConfig.height * tilingConfig.density
  const overlap = tilingConfig.overlap * tilingConfig.density

  let nonEmptyPages = 0
  let pageCursor = 0
  const totalPages =
    Math.ceil(gridImage.bitmap.height / (maxHeight - overlap)) *
    Math.ceil(gridImage.bitmap.width / (maxWidth - overlap))

  const font = await Jimp.loadFont(Jimp.FONT_SANS_12_BLACK)

  for (let j = 0; j < gridImage.bitmap.height; j += maxHeight - overlap) {
    const row: (string | null)[] = []
    pageGrid.push(row)
    handlers.onRow()

    for (let i = 0; i < gridImage.bitmap.width; i += maxWidth - overlap) {
      handlers.onStatus("rendering page: " + ++pageCursor + "/" + totalPages)
      await yieldThreadOrDie(signal)

      const width = Math.min(i + maxWidth, gridImage.bitmap.width) - i
      const height = Math.min(j + maxHeight, gridImage.bitmap.height) - j

      let hasData = false
      for (const { idx } of originalImage.scanIterator(i, j, width, height)) {
        const [r, g, b, a] = [
          originalImage.bitmap.data[idx + 0],
          originalImage.bitmap.data[idx + 1],
          originalImage.bitmap.data[idx + 2],
          originalImage.bitmap.data[idx + 3],
        ]
        if (a !== 0 && (r !== 255 || b !== 255 || g !== 255)) {
          hasData = true
          break
        }
      }

      if (!hasData) {
        row.push(null)
        handlers.onPage(null)
        continue
      }

      const page = new (Jimp as any as typeof Jimp.default)(
        maxWidth,
        maxHeight,
        "#FFFFFF"
      )

      page.blit(gridImage, 0, 0, i, j, width, height)

      page.scan(0, 0, width, 1, fill(255, 0, 0, 255))
      page.scan(0, 0, 1, height, fill(255, 0, 0, 255))

      page.scan(0, height - 1, width, 1, fill(255, 0, 0, 255))
      page.scan(width - 1, 0, 1, height, fill(255, 0, 0, 255))

      const pageLocation = `(${j / (maxHeight - overlap)}, ${i / (maxWidth - overlap)})`
      page.print(font, 10, 10, pageLocation)

      const b64 = await page.getBase64Async(Jimp.MIME_PNG)

      row.push(b64)
      nonEmptyPages++
      handlers.onPage(b64)
    }
  }

  return {
    totalPages: nonEmptyPages,
    totalHeight: round(originalImage.bitmap.height / tilingConfig.density, 2),
    totalWidth: round(originalImage.bitmap.width / tilingConfig.density, 2),
  }
}
