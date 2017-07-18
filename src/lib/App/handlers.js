import { validCharacters } from '../utils/text-stuff'
import store               from 'store'
import pdfjs               from 'pdfjs-dist'

export function onKeyUp(e, topLeftX, topLeftY, size) {
  const offset = size / 2
  const x      = topLeftX + offset
  const y      = topLeftY + offset
  // Go to input field back up, or left
  if(e.keyCode === 8) {
    e.preventDefault()
    if(this.state.writingDirection) {
      this.placeField(x - size, y)
    } else {
      this.placeField(x, y - size)
    }
    return
  }
}

export function onChange(e, topLeftX, topLeftY, size) {
  const c  = e.target.value.charAt(0)
  const id = `${topLeftX}:${topLeftY}`
  if(!e.target.value) {
    this.setCharByKey(id, '')
    return
  }
  if(!validCharacters.test(c)) {
    e.preventDefault()
    return
  }
  // Char is allowed, update state
  this.setCharByKey(id, c)
  const offset = size / 2
  const x      = topLeftX + offset
  const y      = topLeftY + offset
  if(this.state.writingDirection) {
    this.placeField(x + size, y)
  } else {
    this.placeField(x, y + size)
  }
}

export function onCharClick(e, x, y) {
  const id = `${x}:${y}`
  this.setWritingDirection(x, y, () => {
    this.setFocusByKey(id)
  })
}

export function onClick(e) {
  const rect = this.canvas.getBoundingClientRect()
  const canvasX = e.clientX - rect.left
  const canvasY = e.clientY - rect.top
  this.setWritingDirection(canvasX, canvasY)
}

export function onFileInputChange(e) {
  const file    = e.target.files[0]
  const reader  = new FileReader()
  console.log(file)
  if(file.type === 'application/pdf') {
    console.log("handling pdf")
  }
  reader.onload = ((aImg) => {
    return (e) => {
      pdfjs.getDocument(e.target.result)
        .then( (pdf)  => {
          return pdf.getPage(1)
        .then( (page) => {
          console.log("page", page)
          const width    = 600
          const viewport = page.getViewport(1)
          console.log("viewport", viewport)
          const scale          = width / viewport.width
          const scaledViewport = page.getViewport(scale)
          this.canvas.width    = scaledViewport.width
          this.canvas.height   = scaledViewport.height
          // const canvas = document.getElementById('canvas')
          const renderCtx = { canvasContext: this.ctx, viewport: scaledViewport }
          return page.render(renderCtx).promise
        .then( () => {
          console.log(this.canvas.toDataURL('image/png'));
          const image = this.canvas.toDataURL("image/png")
          console.log("image", image)
          store.set('image', image)
          this.setState({ fields: [], writingDirection: true})
          store.set('app-state', '')
          this.updateCanvas()
        })
      })
    })
  }})()
  reader.readAsArrayBuffer(file)
}
