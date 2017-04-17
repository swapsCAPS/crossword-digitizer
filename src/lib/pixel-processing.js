/*
   * Finds each edge of a square
   */
export function square(x, y) {
    let color = this.ctx.getImageData(x, y, 1, 1).data
    if(!isWhite(color)) {
      console.info('Not a white pixel : (')
      return
    }
    const startX = x
    const startY = y
    let right, left, top, bottom
    // Find right border first
    for(let x = 0; x < 30; x++) {
      const pos = startX + x
      color = this.ctx.getImageData(pos, startY, 1, 1).data
      if(!isWhite(color)) {
        right = pos
        break
      }
    }
    // Then find bottom border using right border's pos
    for(let y = 0; y < 30; y++) {
      const pos = startY + y
      color = this.ctx.getImageData(startX, pos, 1, 1).data
      if(!isWhite(color)) {
        bottom = pos
        break
      }
    }
    if(!right || !bottom) {
      console.warn('Could not find center')
      return
    }
    // Then left using bottom right
    for(let x = 0; x < 30; x++) {
      const pos = right - 1 - x
      color = this.ctx.getImageData(pos, bottom - 1, 1, 1).data
      if(!isWhite(color)) {
        left = pos
        break
      }
    }
    // And lastly top using bottom right
    for(let y = 0; y < 30; y++) {
      const pos = bottom - 1 - y
      color = this.ctx.getImageData(right - 1, pos, 1, 1).data
      if(!isWhite(color)) {
        top = pos
        break
      }
    }
    const height   = bottom - top
    const width    = right  - left
    const centerX  = left   + width  / 2
    const centerY  = top    + height / 2
    const tooBig   = width > 50 || height > 50
    const tooSmall = width < 10 || height < 10
    if(tooBig || tooSmall || !height || !width) {
      console.warn('Could not find center')
      return
    }
    return { x: centerX, y: centerY, size: width - 2 }
  }

export function isWhite(color) {
  const bool =
    color[0] === 255 &&
    color[1] === 255 &&
    color[2] === 255 &&
    color[3] === 255
  return bool;
}

export function isBlack(color) {
  const bool = color[0] === 0 &&
    color[1] === 0 &&
    color[2] === 0 &&
    color[3] === 255
  return bool;
}
