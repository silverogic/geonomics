export interface TreemapInput<T> {
  id: string
  value: number
  data: T
}

export interface TreemapRect<T> {
  id: string
  x: number // pixel x or percentage
  y: number // pixel y or percentage
  w: number // pixel width
  h: number // pixel height
  data: T
}

/**
 * Squarified Treemap Algorithm (Bruls, Huizing, van Wijk).
 * Partitions a rectangle (width x height) into nested rectangles with aspect ratios close to 1:1.
 * Subdivides along the shortest side of the remaining space.
 */
export function computeSquarifiedTreemap<T>(
  items: TreemapInput<T>[],
  width: number,
  height: number
): TreemapRect<T>[] {
  if (items.length === 0 || width <= 0 || height <= 0) return []

  // Filter positive values and sort descending
  const sorted = [...items]
    .filter((it) => it.value > 0)
    .sort((a, b) => b.value - a.value)

  if (sorted.length === 0) return []

  const totalValue = sorted.reduce((sum, it) => sum + it.value, 0)
  const totalArea = width * height

  // Normalize item values to area
  const normalized = sorted.map((it) => ({
    ...it,
    area: (it.value / totalValue) * totalArea,
  }))

  const result: TreemapRect<T>[] = []

  let remainingX = 0
  let remainingY = 0
  let remainingW = width
  let remainingH = height

  let currentRow: typeof normalized = []

  function worst(row: typeof normalized, sideLength: number): number {
    if (row.length === 0 || sideLength <= 0) return Infinity
    const s = row.reduce((acc, it) => acc + it.area, 0)
    if (s <= 0) return Infinity

    let maxRatio = -Infinity
    for (const it of row) {
      const lengthAlongSide = (it.area * sideLength) / s
      const thickness = s / sideLength
      if (lengthAlongSide <= 0 || thickness <= 0) continue
      const ratio = Math.max(lengthAlongSide / thickness, thickness / lengthAlongSide)
      if (ratio > maxRatio) maxRatio = ratio
    }
    return maxRatio
  }

  function layoutRow(row: typeof normalized) {
    if (row.length === 0) return
    const rowArea = row.reduce((acc, it) => acc + it.area, 0)

    // Slice along the shorter side
    if (remainingW >= remainingH) {
      // Width is longer than or equal to height: slice along remainingH (vertical column)
      const columnWidth = rowArea / remainingH
      let curY = remainingY
      for (const it of row) {
        const itemHeight = (it.area * remainingH) / rowArea
        result.push({
          id: it.id,
          x: Math.round(remainingX * 100) / 100,
          y: Math.round(curY * 100) / 100,
          w: Math.round(columnWidth * 100) / 100,
          h: Math.round(itemHeight * 100) / 100,
          data: it.data,
        })
        curY += itemHeight
      }
      remainingX += columnWidth
      remainingW = Math.max(0, remainingW - columnWidth)
    } else {
      // Height is longer than width: slice along remainingW (horizontal row)
      const rowHeight = rowArea / remainingW
      let curX = remainingX
      for (const it of row) {
        const itemWidth = (it.area * remainingW) / rowArea
        result.push({
          id: it.id,
          x: Math.round(curX * 100) / 100,
          y: Math.round(remainingY * 100) / 100,
          w: Math.round(itemWidth * 100) / 100,
          h: Math.round(rowHeight * 100) / 100,
          data: it.data,
        })
        curX += itemWidth
      }
      remainingY += rowHeight
      remainingH = Math.max(0, remainingH - rowHeight)
    }
  }

  for (let i = 0; i < normalized.length; i++) {
    const item = normalized[i]
    const shortestSide = Math.min(remainingW, remainingH)
    if (shortestSide <= 0) break

    const candidateRow = [...currentRow, item]
    const currentWorst = worst(currentRow, shortestSide)
    const candidateWorst = worst(candidateRow, shortestSide)

    if (currentRow.length === 0 || candidateWorst <= currentWorst) {
      currentRow.push(item)
    } else {
      layoutRow(currentRow)
      currentRow = [item]
    }
  }

  if (currentRow.length > 0) {
    layoutRow(currentRow)
  }

  return result
}
