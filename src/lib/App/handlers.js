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

export function onFileInputChange(event) {
  event.preventDefault()
  event.persist()
  const file    = event.target.files[0]
  const reader  = new FileReader()
  this.setState({ loading: true })
  if(file.type === 'application/pdf') {
    if(!window.confirm("Using pdf files is still expirimental. Would you like to try anyway?")) {
      event.target.value = null
      return
    }
    reader.onload = (e) => {
        pdfjs.getDocument(e.target.result)
          .then( (pdf)  => {
            return pdf.getPage(1)
          })
          .then( (page) => {
            const width          = window.innerWidth
            const viewport       = page.getViewport(1)
            const scale          = width / viewport.width
            const scaledViewport = page.getViewport(scale)
            this.canvas.width    = scaledViewport.width
            this.canvas.height   = scaledViewport.height
            const renderCtx      = { canvasContext: this.ctx, viewport: scaledViewport }
            return page.render(renderCtx).promise
          })
          .then( () => {
            const image = this.canvas.toDataURL("image/png")
            store.set('image', image)
            this.setState({ loading: false, fields: [], writingDirection: true})
            store.set('app-state', '')
            this.updateCanvas()
            return null
          })
          .catch( (error) => {
            console.log("error", error)
          })
          .finally( () => {
            event.target.value = null
          })
      }
    return reader.readAsArrayBuffer(file)
  }
  reader.onload = (e) => {
      store.set('image', e.target.result)
      store.set('app-state', '')
      this.updateCanvas()
      this.setState({ loading: false, fields: [], writingDirection: true})
      event.target.value = null
    }
  return reader.readAsDataURL(file)
}
