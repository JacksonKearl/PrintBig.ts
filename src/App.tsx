import { FC, useRef, useState } from "preact/compat"
import useQueryState, {
  Jimp,
  TJimp,
  emptyImage,
  round,
  yieldThread,
} from "./utils"
import { gridify } from "./gridify"
import { paginate } from "./paginate"

export const App: FC = () => {
  const image = useRef<HTMLInputElement>(null)
  const print = useRef<HTMLButtonElement>(null)
  const result = useRef<HTMLDivElement>(null)
  const statusElement = useRef<HTMLDivElement>(null)

  const [unit, setUnit] = useQueryState("unit", "inch")
  const [width, setWidth] = useQueryState("width", 8)
  const [height, setHeight] = useQueryState("height", 10.5)
  const [overlap, setOverlap] = useQueryState("overlap", 0.2)
  const [density, setDensity] = useQueryState("density", 300)
  const [gridSize, setGridSize] = useQueryState("gridSize", 1)
  const [status, setStatus] = useState("")

  const parsedImage = useRef<TJimp | null>(null)

  const render = async (e: SubmitEvent) => {
    e.preventDefault()

    while (result.current?.firstChild)
      result.current.removeChild(result.current.firstChild)

    const cssUnit = unit === "inch" ? "in" : unit
    const cssWidth = width + cssUnit
    const cssHeight = height + cssUnit

    const style = document.createElement("style")
    style.textContent = `
      img {
        height: calc(${cssHeight} / pi);
        width: calc(${cssWidth} / pi);
      }
      
      @media print {
        img {
          height: ${cssHeight};
          width: ${cssWidth};
        }
      }`

    result.current?.appendChild(style)

    if (!parsedImage.current) {
      setStatus(
        'loading image data...\n(for best performance, ensure "advanced protection" is disabled)'
      )
      await yieldThread()
      const rawImageData = await image.current!.files![0].arrayBuffer()
      parsedImage.current =
        parsedImage.current ?? (await Jimp.read(rawImageData as Buffer))
    }

    setStatus("drawing grid...")
    await yieldThread()
    const gridImage = gridify(parsedImage.current, density, gridSize)

    let row: HTMLDivElement

    const onPage = (page: string | null): void => {
      const img = document.createElement("img")
      if (page) {
        img.src = page
      } else {
        img.src = emptyImage
        img.classList.add("empty")
      }
      row.appendChild(img)
    }
    const onRow = () => {
      row = document.createElement("div")
      result.current?.appendChild(row)
    }
    const onStatus = (status: string): void => setStatus(status)
    const stats = await paginate(
      gridImage,
      parsedImage.current,
      density,
      width,
      height,
      overlap,
      onPage,
      onRow,
      onStatus
    )
    result.current?.appendChild(row!)
    setStatus(
      `printed image is ${stats.totalWidth}${cssUnit} x ${stats.totalHeight}${cssUnit} on ${stats.totalPages} pages.`
    )
    print.current!.disabled = false
  }

  return (
    <>
      <div class={"stack nonprint"}>
        <h1>PrintBig</h1>
        <span>
          fully local large scale image printing
          {" – "}
          <a href="https://github.com/JacksonKearl/PrintBig.ts">source</a>
          {" – "}
          <a href="https://woodgears.ca/bigprint/">original BigPrint</a>
        </span>
        <span>
          <a href="/">letter preset</a>
          {" – "}
          <a
            href={
              '/?overlap=0.5&density=118&height=27&width=19&gridSize=2&unit="cm"'
            }
          >
            a4 preset
          </a>
        </span>
        <form onSubmit={render} style={{ marginTop: "10px" }} class={"stack"}>
          <label>
            <span>source image:</span>
            <input
              type="file"
              ref={image}
              onChange={() => {
                parsedImage.current = null
                print.current!.disabled = true
              }}
              required
              accept="image/png, image/jpeg, image/bmp, image/tiff"
            >
              select
            </input>
          </label>
          <label>
            <span>base unit:</span>
            <select
              value={unit}
              onChange={(e) => {
                const newUnit = e.currentTarget.value
                setUnit((priorUnit) => {
                  if (newUnit !== priorUnit) {
                    if (newUnit === "inch") {
                      setDensity((prior) => round(prior * 2.54))
                      setHeight((prior) => round(prior / 2.54, 1))
                      setWidth((prior) => round(prior / 2.54, 1))
                      setOverlap((prior) => round(prior / 2.54, 1))
                      setGridSize((prior) => round(prior / 2.54, 1))
                    } else {
                      setDensity((prior) => round(prior / 2.54))
                      setHeight((prior) => round(prior * 2.54, 1))
                      setWidth((prior) => round(prior * 2.54, 1))
                      setOverlap((prior) => round(prior * 2.54, 1))
                      setGridSize((prior) => round(prior * 2.54, 1))
                    }
                  }
                  return newUnit
                })
              }}
            >
              <option value="inch">inch</option>
              <option value="cm">cm</option>
            </select>
          </label>
          <label>
            <span>print density:</span>
            <span>
              <input
                type="number"
                step="any"
                value={density}
                onChange={(e) => setDensity(+e.currentTarget.value)}
              ></input>{" "}
              {unit === "inch" ? "ppi" : "ppcm"}
            </span>
          </label>
          <label>
            <span>tile width:</span>
            <span>
              <input
                type="number"
                step="any"
                min={1}
                value={width}
                onChange={(e) => setWidth(+e.currentTarget.value)}
              ></input>{" "}
              {unit}
            </span>
          </label>
          <label>
            <span>tile height:</span>
            <span>
              <input
                type="number"
                min={1}
                step="any"
                value={height}
                onChange={(e) => setHeight(+e.currentTarget.value)}
              ></input>{" "}
              {unit}
            </span>
          </label>
          <label>
            <span>tile overlap:</span>
            <span>
              <input
                type="number"
                step="any"
                value={overlap}
                onChange={(e) => setOverlap(+e.currentTarget.value)}
              ></input>{" "}
              {unit}
            </span>
          </label>
          <label>
            <span>grid size:</span>
            <span>
              <input
                type="number"
                step="any"
                value={gridSize}
                onChange={(e) => setGridSize(+e.currentTarget.value)}
              ></input>{" "}
              {unit}
            </span>
          </label>
          <div>
            <button style={{ width: "100px", margin: "5px" }} type={"submit"}>
              render
            </button>
            <button
              ref={print}
              style={{ width: "100px", margin: "5px" }}
              onClick={(e) => {
                e.preventDefault()
                alert(
                  "Note: To ensure proper scale prints, you *MUST* configure the print dialog to have the appropriate page size, orientation, and *MARGINS* small enough to accommodate your tile size."
                )
                window.print()
              }}
              disabled
            >
              print
            </button>
          </div>
          {status ? (
            <span
              ref={statusElement}
              style={{ whiteSpace: "pre", textAlign: "center" }}
            >
              {status}
            </span>
          ) : null}
        </form>
      </div>
      <div ref={result} class={"print"}></div>
    </>
  )
}
